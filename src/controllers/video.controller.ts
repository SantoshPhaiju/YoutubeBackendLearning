import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Video } from '../models/video.model';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import asyncWrapper from '../utils/asyncWrapper';
import { uploadOnCloudinary } from '../utils/cloudinary';
import { detectCategory } from '../utils/detectCategory';
import extractTags from '../utils/extractTags';

export const uploadVideo = asyncWrapper(async (req: Request, res: Response) => {
    const { title, description, visibility } = req.body;

    // Todo: Take Video file and thumbnail file and upload to cloudinary
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

    const categoryId = await detectCategory({ title, description });
    const tags = extractTags(title, description);

    const video = new Video({
        title: title,
        description: description,
        visibility: visibility,
        thumbnail: thumbnailCloudinaryUrl,
        videoFile: videoCloudinaryUrl,
        owner: req.user._id,
        duration: videoCloudinaryResponse.reponse.duration, // todo: get duration of video
        categoryId: categoryId,
        tags: tags,
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
                    _id: new mongoose.Types.ObjectId(videoId),
                    $or: [
                        // Show the video if it is public
                        {
                            // _id: new mongoose.Types.ObjectId(videoId),
                            visibility: 'public',
                        },
                        // Show the video if it is private and the user is the owner
                        ...(isLoggedIn
                            ? [
                                  {
                                      // _id: new mongoose.Types.ObjectId(videoId),
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
            {
                $lookup: {
                    from: 'likes',
                    let: { videoId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$video', '$$videoId'] },
                                        { $eq: ['$likedBy', req.user._id] },
                                    ],
                                },
                            },
                        },
                        { $limit: 1 },
                    ],
                    as: 'likedData',
                },
            },
            {
                $addFields: {
                    isLiked: { $gt: [{ $size: '$likedData' }, 0] },
                },
            },
            {
                $project: {
                    likedData: 0,
                },
            },
        ];

        const video = await Video.aggregate(pipeline);

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

export const getHomePageVideos = asyncWrapper(
    async (req: Request, res: Response) => {
        const videos = await Video.find({ visibility: 'public' })
            .sort({ createdAt: -1 })
            .limit(20)
            .populate('owner', 'username fullname avatar');

        if (!videos || videos.length === 0) {
            throw new ApiError(404, 'No videos found');
        }

        res.status(200).json(
            new ApiResponse(200, 'Videos fetched successfully', {
                videos,
            })
        );
    }
);

export const trackVideoViews = asyncWrapper(
    async (req: Request, res: Response) => {
        const { videoId } = req.params;

        // * This is not the ideal case where we use the things like this which can be passed by multiple api calls right away so what we gonna use is:

        /*
        TODO: Implement secure video view tracking system

        1. When user clicks the video:
           - Send a POST request to /start-view (protected route)
           - Backend generates a sessionId for this video view
           - Store in DB: { userId, videoId, sessionId, createdAt, counted: false }

        2. On frontend:
           - Start timer based on video duration:
             - < 60 sec → 15% of duration
             - ≥ 60 sec → 20 seconds
           - After timer ends, send POST request to /track-view with sessionId

        3. Backend validation on /track-view:
           - Check if user is logged in
           - Verify sessionId exists for userId + videoId
           - Check if session already counted OR user viewed this video in last X minutes (e.g., 10 min)
           - If valid, increment video view count and mark session as counted
           - Else, ignore

        4. Optional improvements:
           - Use Redis for storing active view sessions for faster checks
           - Track pause/resume events for more accurate watch time
           - Add rate limiting / anti-bot measures to prevent fake views
           - Consider analytics logs for later reporting



           * And additionally in the frontend what we are gonna do is, track the video playback time by the user, like when user clicks the video it auto plays right and we gonna send an api request to backend like video started and store the time in View model started time, we start the measure the time if user pause the video we stop the time so that we can measure the watch duration by the user, then when the user exists the video or change the video then the endVideo api will be hit and we store the view and backend decides to update the view or not, and also stores the userId/ipAddress to rate limit, like if a user has viewed the video again in the ${certainTimeFrame} let's say 10 minutes then that view will be not count and to prevent from hitting the api multiple times from the same ip address like 30 times in 1 minute in the same video then we will block the ip or do something like that, or we can only block that ip address for that trackViewApi
        */

        const video = await Video.findByIdAndUpdate(
            videoId,
            {
                $inc: { viewCount: 1 },
            },
            {
                new: true,
            }
        );

        if (!video) {
            throw new ApiError(404, 'Video not found');
        }

        res.status(200).json(
            new ApiResponse(200, 'Video views tracked successfully', {
                viewCount: video?.viewCount,
            })
        );
    }
);
