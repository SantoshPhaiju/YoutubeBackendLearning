import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Comment } from '../models/comment.model';
import { Video } from '../models/video.model';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import asyncWrapper from '../utils/asyncWrapper';

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
    const populatedComment = await newComment.populate(
        'author',
        '-password -createdAt -updatedAt -refreshToken -watchHistory -coverImage'
    );

    const commentObj = populatedComment.toObject();

    commentObj.totalReplies = 0;

    res.status(201).json(
        new ApiResponse(201, 'Comment added successfully', commentObj)
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
        const comments = await Comment.find({
            video: videoId,
            level: 0,
            isDeleted: false,
        })
            .lean()
            .populate({
                path: 'author',
                select: '-password -createdAt -updatedAt -refreshToken -watchHistory -coverImage',
            })
            .select('-isDeleted');

        if (!comments) {
            throw new ApiError(404, 'No comments found for this video');
        }

        const commentsWithRepliesCount = await Promise.all(
            comments.map(async (comment) => {
                const totalReplies = await Comment.countDocuments({
                    rootId: comment._id,
                    isDeleted: false,
                });
                return {
                    ...comment,
                    totalReplies,
                };
            })
        );

        res.status(200).json(
            new ApiResponse(
                200,
                'Comments fetched successfully',
                commentsWithRepliesCount
            )
        );
    }
);

export const replyToComment = asyncWrapper(
    async (req: Request, res: Response) => {
        const commentId = req.params.commentId;
        const userId = req.user._id;

        if (!commentId) {
            throw new ApiError(404, 'Comment is required');
        }

        const targetComment = await Comment.findById(commentId)
            .populate('author', 'fullname username avatar _id')
            .populate('parentId', '_id level');

        let rootId;
        let level;
        let parent;

        // If parent is already level 3 → attach to level 2
        if (targetComment.level === 3) {
            const level2Parent = await Comment.findById(targetComment.parentId);

            parent = level2Parent._id;
            level = 3;
            rootId = targetComment.rootId || level2Parent._id;
        } else {
            parent = targetComment._id;
            level = targetComment.level + 1;
            rootId = targetComment.rootId || targetComment._id;
        }
        const rootComment = await Comment.findById(rootId);

        if (!targetComment) throw new ApiError(404, 'Comment not found');

        const { comment } = req.body;
        if (!comment) {
            throw new ApiError(400, 'Comment is required');
        }

        const reply = await Comment.create({
            content: comment,
            video: rootComment.video,
            author: userId,
            parentId: parent,
            rootId: rootId,
            level: level,
            replyingToId: targetComment.author._id,
        });

        if (!reply) {
            throw new ApiError(500, 'Something went wrong while replying');
        }
        const responseReply = await Comment.findById(reply._id).lean().populate("author", "fullname username avatar _id");

        res.status(201).json(
            new ApiResponse(201, 'Reply added successfully', responseReply)
        );
    }
);

export const getCommentReplies = asyncWrapper(
    async (req: Request, res: Response) => {
        const commentId = req.params.commentId;

        const parentComment = await Comment.findById(commentId);
        if (!parentComment) throw new ApiError(404, 'Comment not found');

        interface FlatComment {
            _id: mongoose.Types.ObjectId;
            parentId: mongoose.Types.ObjectId | null;
            rootId: mongoose.Types.ObjectId | null;
            content: string;
            author: any;
            replyingToId?: any;
            createdAt: Date;
            updatedAt: Date;
            level: number;
            isDeleted: boolean;
            likeCount: number;
        }

        interface CommentWithReplies extends FlatComment {
            replies: CommentWithReplies[];
            totalReplies?: number;
        }

        // Function to count total replies recursively
        const countTotalReplies = (comment: CommentWithReplies): number => {
            if (!comment.replies || comment.replies.length === 0) {
                return 0;
            }
            return (
                comment.replies.length +
                comment.replies.reduce(
                    (total, reply) => total + countTotalReplies(reply),
                    0
                )
            );
        };

        // Function to add totalReplies to all comments recursively
        const addTotalRepliesToTree = (comment: CommentWithReplies) => {
            comment.totalReplies = countTotalReplies(comment);
            if (comment.replies && comment.replies.length > 0) {
                comment.replies.forEach(addTotalRepliesToTree);
            }
        };

        // Fetch all replies under this comment (level 1,2,3)
        const replies = (await Comment.find({
            rootId: parentComment._id,
            isDeleted: false,
        })
            .sort({ createdAt: 1 })
            .populate({
                path: 'author',
                select: 'fullname username avatar _id',
            })
            .populate({
                path: 'replyingToId',
                select: 'fullname username _id',
            })
            .select('-video -isDeleted')
            .lean()) as unknown as FlatComment[];

        // Convert flat replies → tree
        const map = new Map<string, CommentWithReplies>();
        replies.forEach((r: FlatComment) =>
            map.set(r._id.toString(), { ...r, replies: [] })
        );

        const rootReplies: CommentWithReplies[] = [];

        replies.forEach((r) => {
            const node = map.get(r._id.toString())!;
            if (
                !r.parentId ||
                r.parentId.toString() === parentComment._id.toString()
            ) {
                rootReplies.push(node);
            } else {
                const parent = map.get(r.parentId.toString());
                if (parent) parent.replies.push(node);
            }
        });

        // Add totalReplies count to all comments in the tree
        rootReplies.forEach(addTotalRepliesToTree);

        res.status(200).json(
            new ApiResponse(200, 'Replies fetched successfully', rootReplies)
        );
    }
);
