import mongoose, { Schema } from 'mongoose';

const likeSchema = new Schema(
    {
        comment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment',
        },
        video: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Video',
        },
        tweet: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tweet',
        },
        likedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        type: {
            type: String,
            enum: ['like', 'dislike'],
            default: 'like',
        },
    },
    {
        timestamps: true,
    }
);

likeSchema.index(
    {
        comment: 1,
        video: 1,
        tweet: 1,
        likedBy: 1,
    },
    {
        unique: true,
    }
);

export const Like = mongoose.model('Like', likeSchema);
