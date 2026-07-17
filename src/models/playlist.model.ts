import mongoose, { Schema } from 'mongoose';

const playlistSchema = new Schema(
    {
        playlistName: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        videos: [
            {
                video: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Video',
                },
                sequence: {
                    type: Number,
                    default: 0,
                },
                addedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        visibility: {
            type: String,
            enum: ['public', 'private'],
            default: 'public',
        },
        type: {
            type: String,
            enum: ['playlist', 'watchlater', 'likedvideos'],
            default: 'playlist',
        },
        isSystem: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

export const Playlist = mongoose.model('Playlist', playlistSchema);
