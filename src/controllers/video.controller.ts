import { Request, Response } from 'express';
import { Video } from '../models/video.model';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import asyncWrapper from '../utils/asyncWrapper';
import { uploadOnCloudinary } from '../utils/cloudinary';

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
