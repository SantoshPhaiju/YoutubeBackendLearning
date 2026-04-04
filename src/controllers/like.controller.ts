import asyncWrapper from '../utils/asyncWrapper';

import { Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';
import { Like } from '../models/like.model';
import { ApiResponse } from '../utils/ApiResponse';
import { Video } from '../models/video.model';

export const toggleLike = asyncWrapper(async (req: Request, res: Response) => {
    const videoId = req.params.videoId;
    if (!videoId) {
        throw new ApiError(400, 'Video ID is required');
    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, 'Video not found');
    }
    const userId = req.user._id;

    const like = await Like.findOne({
        video: videoId,
        likedBy: userId,
    });

    if (like) {
        const unLike = await Like.findByIdAndDelete(like._id);
        if (!unLike)
            throw new ApiError(
                500,
                'Something went wrong while unliking the video.'
            );

        const updateLikeCount = await Video.findByIdAndUpdate(video._id, {
            $inc: { likeCount: -1 },
        });

        if (!updateLikeCount) throw new ApiError(500, 'Something went wrong!');

        res.status(200).json(new ApiResponse(200, 'Unliked the video.', null));
        return;
    }

    const newLike = await Like.create({
        video: videoId,
        likedBy: userId,
    });

    if (!newLike)
        throw new ApiError(500, 'Something went wrong while liking the video.');

    const updateLikeCount = await Video.findByIdAndUpdate(video._id, {
        $inc: { likeCount: 1 },
    });

    if (!updateLikeCount) throw new ApiError(500, 'Something went wrong!');

    res.status(200).json(new ApiResponse(200, 'Liked the video.', null));
});
