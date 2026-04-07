import mongoose, { Schema } from 'mongoose';

const commentSchema = new Schema(
    {
        video: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Video',
            required: true,
        },
        // parentId will be null for root comments and will contain the id of the parent comment for replies
        parentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment',
            default: null,
        },
        // we need root when nesting deep in the level
        rootId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment',
            default: null,
        },
        // replyingToId will be null for root comments and will contain the id of the user who is replying to the parent comment
        replyingToId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        level: { type: Number, default: 0 },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        content: { type: String, required: true, maxlength: 2000 },
        likeCount: {
            type: Number,
            default: 0,
        },
        isDeleted: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
);

commentSchema.index({ videoId: 1, parentId: 1, createdAt: -1 });

export const Comment = mongoose.model('Comment', commentSchema);
