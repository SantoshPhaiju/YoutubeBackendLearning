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

    const newComment = await Comment.create({
        content: comment,
        video: videoId,
        author: userId,
    });

    if (!newComment) {
        throw new ApiError(500, 'Something went wrong while adding comment');
    }

    res.status(201).json(
        new ApiResponse(201, 'Comment added successfully', newComment)
    );
});

export const getCommentsOfVideo = asyncWrapper(
    async (req: Request, res: Response) => {
        const videoId = req.params.videoId;
        if (!videoId) {
            throw new ApiError(400, 'Video ID is required');
        }
        const video = await Video.findById(videoId);
        if (!video) {
            throw new ApiError(404, 'Video not found');
        }
        const comments = await Comment.find({ video: videoId }).lean().populate(
            {
                path: 'author',
                select: '-password -createdAt -updatedAt -refreshToken -watchHistory -coverImage'
            }
        );

        if (!comments) {
            throw new ApiError(404, 'No comments found for this video');
        }

        res.status(200).json(
            new ApiResponse(200, 'Comments fetched successfully', comments)
        );
    }
);
