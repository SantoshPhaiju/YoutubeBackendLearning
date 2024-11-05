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
        }
    },
    {
        timestamps: true,
    }
);

export const Comment = mongoose.model('Comment', commentSchema);
