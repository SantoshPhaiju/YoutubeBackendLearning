import { Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import asyncWrapper from '../utils/asyncWrapper';
import { uploadOnCloudinary } from '../utils/cloudinary';
import { Video } from '../models/video.model';

export const uploadVideo = asyncWrapper(async (req: Request, res: Response) => {
    console.log('req.files', req.files);
    console.log('req.body', req.body);

    const { title, description, visiblity } = req.body;

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

    const videoCloudinaryUrl = await uploadOnCloudinary(videoLocalPath);
    const thumbnailCloudinaryUrl = await uploadOnCloudinary(thumbnailLocalPath);

    if (!videoCloudinaryUrl || !thumbnailCloudinaryUrl) {
        throw new ApiError(500, 'Failed to upload video or thumbnail');
    }

    const video = new Video({
        title,
        description,
        visiblity,
        thumbnail: thumbnailCloudinaryUrl,
        videoFile: videoCloudinaryUrl,
        owner: req.user._id,
        
    })

    res.status(201).json(
        new ApiResponse(201, 'Video uploaded successfully', {})
    );
});
