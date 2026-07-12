import asyncWrapper from '../utils/asyncWrapper';

import { Request, Response } from 'express';
import { Comment } from '../models/comment.model';
import { Like } from '../models/like.model';
import { Video } from '../models/video.model';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';

export const toggleLike = asyncWrapper(async (req: Request, res: Response) => {
    const videoId = req.params?.videoId;
    const commentId = req.params?.commentId;
    let type = 'video';

    if (!videoId && !commentId) {
        throw new ApiError(400, `Comment ID or Video ID is required!`);
    }

    if (videoId) type = 'video';
    if (commentId) type = 'comment';

    let video;
    let comment;

    if (videoId) {
        video = await Video.findById(videoId);
        if (!video) {
            throw new ApiError(404, 'Video not found');
        }
    }

    if (commentId) {
        comment = await Comment.findById(commentId);
        if (!comment) {
            throw new ApiError(404, 'Comment not found');
        }
    }

    const userId = req.user._id;
    const reactionType = req.body.type;
    if (!reactionType) {
        throw new ApiError(400, 'Reaction type is required');
    }
    if (!['like', 'dislike'].includes(reactionType))
        throw new ApiError(400, 'Invalid reaction type');

    const like = await Like.findOne({
        [type]: type === 'video' ? videoId : commentId,
        likedBy: userId,
    });
    const model = type === 'video' ? Video : Comment;

    if (like) {
        if (like.type === reactionType) {
            const unLike = await like.deleteOne();
            if (!unLike) {
                throw new ApiError(
                    500,
                    `Something went wrong while unliking or disliking the ${type}.`
                );
            }
            if (reactionType === 'like') {
                const updateLikeCount = await model.findByIdAndUpdate(
                    type === 'video' ? video._id : comment._id,
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
                    new ApiResponse(200, `Unliked the ${type}.`, {
                        likeCount: updateLikeCount?.likeCount,
                    })
                );
            } else {
                const dislikeCount = await model.findByIdAndUpdate(
                    type === 'video' ? video._id : comment._id,
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
                    new ApiResponse(200, `Removed dislike the ${type}.`, {
                        likeCount: dislikeCount?.dislikeCount,
                    })
                );
            }
            return;
        } else {
            const changeReaction = await Like.findByIdAndUpdate(like._id, {
                type: reactionType,
            });
            if (!changeReaction) {
                throw new ApiError(500, 'Something went wrong!');
            }
            if (like.type === 'like') {
                const updateDislikeCount = await model.findByIdAndUpdate(
                    type === 'video' ? video._id : comment._id,
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
                    new ApiResponse(200, `Disliked the ${type}.`, {
                        likeCount: updateDislikeCount?.likeCount,
                    })
                );
            } else {
                const updateLikeCount = await model.findByIdAndUpdate(
                    type === 'video' ? video._id : comment._id,
                    {
                        $inc: { dislikeCount: -1, likeCount: 1 },
                    },
                    {
                        new: true,
                    }
                );
                res.status(200).json(
                    new ApiResponse(200, `Liked the ${type}.`, {
                        likeCount: updateLikeCount?.likeCount,
                    })
                );
            }
            return;
        }
    }

    const newLike = await Like.create({
        [type]: type === 'video' ? videoId : commentId,
        likedBy: userId,
        type: reactionType,
    });

    if (!newLike) throw new ApiError(500, 'Something went wrong.');

    if (reactionType === 'like') {
        const updateLikeCount = await model.findByIdAndUpdate(
            type === 'video' ? video._id : comment._id,
            {
                $inc: { likeCount: 1 },
            },
            {
                new: true,
            }
        );

        if (!updateLikeCount) throw new ApiError(500, 'Something went wrong!');
        res.status(200).json(
            new ApiResponse(200, `Liked the ${type}.`, {
                likeCount: updateLikeCount?.likeCount,
            })
        );
    } else {
        const updatedDislikeCount = await model.findByIdAndUpdate(
            type === 'video' ? video._id : comment._id,
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
            new ApiResponse(200, `Disliked the ${type}.`, {
                likeCount: updatedDislikeCount?.likeCount,
            })
        );
    }
});
