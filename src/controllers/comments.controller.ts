import asyncWrapper from '../utils/asyncWrapper';
import { Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';
import { Video } from '../models/video.model';
import { Comment } from '../models/comment.model';
import { ApiResponse } from '../utils/ApiResponse';

export const addComment = asyncWrapper(async (req: Request, res: Response) => {
    const videoId = req.params.videoId;
    if (!videoId) {
        throw new ApiError(400, 'Video ID is required');
    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, 'Video not found');
    }
    const userId = req.user._id;

    const { comment } = req.body;
    if (!comment) {
        throw new ApiError(400, 'Comment is required');
    }

    console.log("comment: ", comment)

    const newComment = await Comment.create(
        {
            content: comment,
            video: videoId,
            commentedBy: userId,
        }
    );

    if (!newComment) {
        throw new ApiError(500, 'Something went wrong while adding comment');
    }

    res.status(201).json(
        new ApiResponse(201, 'Comment added successfully', newComment)
    );
});

export const addReply = asyncWrapper(async (req: Request, res: Response) => {
    const videoId = req.params.videoId;
    const commentId = req.params.commentId;
    if (!videoId) {
        throw new ApiError(400, 'Video ID is required');
    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, 'Video not found');
    }

});
