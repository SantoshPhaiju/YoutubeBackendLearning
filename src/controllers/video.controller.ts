import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Video } from '../models/video.model';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import asyncWrapper from '../utils/asyncWrapper';
import { uploadOnCloudinary } from '../utils/cloudinary';

export const uploadVideo = asyncWrapper(async (req: Request, res: Response) => {
    const { title, description, visibility } = req.body;
    
    let videoLocalPath = '';
    let thumbnailLocalPath = '';

    if (req.files && 'videoFile' in req.files) {
        videoLocalPath = req.files.videoFile[0]?.path;
    }

    if (req.files && 'thumbnail' in req.files) {
        thumbnailLocalPath = req.files.thumbnail[0]?.path;
    }

    if (!videoLocalPath) {
        throw new ApiError(400, 'Video is required');
    }

    if (!thumbnailLocalPath) {
        throw new ApiError(400, 'Thumbnail is required');
    }

    const videoCloudinaryResponse = await uploadOnCloudinary(videoLocalPath);
    const thumbnailCloudinaryResponse =
        await uploadOnCloudinary(thumbnailLocalPath);

    const videoCloudinaryUrl = videoCloudinaryResponse?.url;
    const thumbnailCloudinaryUrl = thumbnailCloudinaryResponse?.url;

    if (!videoCloudinaryUrl || !thumbnailCloudinaryUrl) {
        throw new ApiError(500, 'Failed to upload video or thumbnail');
    }

    const video = new Video({
        title: title,
        description: description,
        visibility: visibility,
        thumbnail: thumbnailCloudinaryUrl,
        videoFile: videoCloudinaryUrl,
        owner: req.user._id,
        duration: videoCloudinaryResponse.reponse.duration, // todo: get duration of video
    });

    const uploadedVideo = await video.save();

    res.status(201).json(
        new ApiResponse(201, 'Video uploaded successfully', {
            video: uploadedVideo,
        })
    );
});

export const getVideoById = asyncWrapper(
    async (req: Request, res: Response) => {
        const { videoId } = req.params;
        // console.log('videoid', videoId);

        // Check if the user is logged in
        const isLoggedIn = (req.user && req.user._id) || false;

        // const pipeline = [
        //     {
        //         $match: {
        //             $or: [
        //                 {
        //                     _id: new mongoose.Types.ObjectId(videoId),
        //                 },
        //             ],
        //         },
        //     },
        //     {
        //         $lookup: {
        //             from: 'users',
        //             localField: 'owner',
        //             foreignField: '_id',
        //             as: 'owner',
        //             pipeline: [
        //                 {
        //                     $lookup: {
        //                         from: 'subscriptions',
        //                         localField: '_id',
        //                         foreignField: 'channel',
        //                         as: 'subscribers',
        //                     },
        //                 },
        //                 {
        //                     $addFields: {
        //                         subscribersCount: { $size: '$subscribers' },
        //                         isSubscribed: isLoggedIn
        //                             ? {
        //                                   $in: [
        //                                       req.user._id,
        //                                       '$subscribers.subscriber',
        //                                   ],
        //                               }
        //                             : false,
        //                     },
        //                 },
        //                 {
        //                     $project: {
        //                         username: 1,
        //                         fullname: 1,
        //                         email: 1,
        //                         avatar: 1,
        //                         createdAt: 1,
        //                         subscribersCount: 1,
        //                         isSubscribed: 1,
        //                     },
        //                 },
        //             ],
        //         },
        //     },
        // ];

        const pipeline = [
            {
                $match: {
                    $or: [
                        // Show the video if it is public
                        {
                            _id: new mongoose.Types.ObjectId(videoId),
                            visibility: 'public',
                        },
                        // Show the video if it is private and the user is the owner
                        ...(isLoggedIn
                            ? [
                                  {
                                      _id: new mongoose.Types.ObjectId(videoId),
                                      visibility: 'private',
                                      owner: req.user._id,
                                  },
                              ]
                            : []),
                    ],
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'owner',
                    foreignField: '_id',
                    as: 'owner',
                    pipeline: [
                        {
                            $lookup: {
                                from: 'subscriptions',
                                localField: '_id',
                                foreignField: 'channel',
                                as: 'subscribers',
                            },
                        },
                        {
                            $addFields: {
                                subscribersCount: { $size: '$subscribers' },
                                isSubscribed: isLoggedIn
                                    ? {
                                          $in: [
                                              req.user._id,
                                              '$subscribers.subscriber',
                                          ],
                                      }
                                    : false,
                                isOwner: isLoggedIn
                                    ? { $eq: ['$_id', req.user._id] }
                                    : false,
                            },
                        },
                        {
                            $project: {
                                username: 1,
                                fullname: 1,
                                email: 1,
                                avatar: 1,
                                createdAt: 1,
                                subscribersCount: 1,
                                isSubscribed: 1,
                                isOwner: 1,
                            },
                        },
                    ],
                },
            },
        ];

        const video = await Video.aggregate(pipeline);
        console.log('video', video);

        if (!video || video.length === 0) {
            throw new ApiError(404, 'Video not found');
        }

        res.status(200).json(
            new ApiResponse(200, 'Video fetched successfully', {
                video: video[0],
            })
        );
    }
);
