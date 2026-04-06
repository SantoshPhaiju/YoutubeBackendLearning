import mongoose, { Schema } from 'mongoose';

const commentSchema = new Schema(
    {
        content: {
            type: String,
            required: true,
        },
        video: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Video',
        },
        commentedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        likeCount: {
            type: Number,
            default: 0,
        },
        isReply: {
            type: Boolean,
            default: false,
        },
        replies: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Comment',
            },
        ],
    },
    {
        timestamps: true,
    }
);

export const Comment = mongoose.model('Comment', commentSchema);
