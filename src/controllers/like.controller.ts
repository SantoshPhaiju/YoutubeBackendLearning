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
    const type = req.body.type;
    if (!type) {
        throw new ApiError(400, 'Type is required');
    }
    if (!['like', 'dislike'].includes(type))
        throw new ApiError(400, 'Invalid reaction type');

    const like = await Like.findOne({
        video: videoId,
        likedBy: userId,
    });

    if (like) {
        if (like.type === type) {
            const unLike = await like.deleteOne();
            if (!unLike) {
                throw new ApiError(
                    500,
                    'Something went wrong while unliking or disliking the video.'
                );
            }
            if (type === 'like') {
                const updateLikeCount = await Video.findByIdAndUpdate(
                    video._id,
                    {
                        $inc: { likeCount: -1 },
                    },
                    {
                        new: true,
                    }
                );
                if (!updateLikeCount)
                    throw new ApiError(500, 'Something went wrong!');
                res.status(200).json(
                    new ApiResponse(200, 'Unliked the video.', {
                        likeCount: updateLikeCount?.likeCount,
                    })
                );
            } else {
                const dislikeCount = await Video.findByIdAndUpdate(
                    video._id,
                    {
                        $inc: { dislikeCount: -1 },
                    },
                    {
                        new: true,
                    }
                );
                if (!dislikeCount) {
                    throw new ApiError(500, 'Something went wrong!');
                }
                res.status(200).json(
                    new ApiResponse(200, 'Removed dislike the video.', {
                        likeCount: dislikeCount?.dislikeCount,
                    })
                );
            }
            return;
        } else {
            const changeReaction = await Like.findByIdAndUpdate(like._id, {
                type: type,
            });
            if (!changeReaction) {
                throw new ApiError(500, 'Something went wrong!');
            }
            if (like.type === 'like') {
                const updateDislikeCount = await Video.findByIdAndUpdate(
                    videoId,
                    {
                        $inc: { likeCount: -1, dislikeCount: 1 },
                    },
                    {
                        new: true,
                    }
                );

                if (!updateDislikeCount) {
                    throw new ApiError(500, 'Something went wrong!');
                }
                res.status(200).json(
                    new ApiResponse(200, 'Disliked the video.', {
                        likeCount: updateDislikeCount?.likeCount,
                    })
                );
            } else {
                const updateLikeCount = await Video.findByIdAndUpdate(
                    videoId,
                    {
                        $inc: { dislikeCount: -1, likeCount: 1 },
                    },
                    {
                        new: true,
                    }
                );
                res.status(200).json(
                    new ApiResponse(200, 'Liked the video.', {
                        likeCount: updateLikeCount?.likeCount,
                    })
                );
            }
            return;
        }
    }

    const newLike = await Like.create({
        video: videoId,
        likedBy: userId,
        type: type,
    });

    if (!newLike) throw new ApiError(500, 'Something went wrong.');

    if (type === 'like') {
        const updateLikeCount = await Video.findByIdAndUpdate(
            video._id,
            {
                $inc: { likeCount: 1 },
            },
            {
                new: true,
            }
        );

        if (!updateLikeCount) throw new ApiError(500, 'Something went wrong!');
        res.status(200).json(
            new ApiResponse(200, 'Liked the video.', {
                likeCount: updateLikeCount?.likeCount,
            })
        );
    } else {
        const updatedDislikeCount = await Video.findByIdAndUpdate(
            video._id,
            {
                $inc: { dislikeCount: 1 },
            },
            {
                new: true,
            }
        );

        if (!updatedDislikeCount)
            throw new ApiError(500, 'Something went wrong!');
        res.status(200).json(
            new ApiResponse(200, 'Disliked the video.', {
                likeCount: updatedDislikeCount?.likeCount,
            })
        );
    }
});
