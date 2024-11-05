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
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Video',
            }
        ],
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        visibility: {
            type: String,
            enum: ['public', 'private'],
            default: 'public',
        }
    },
    {
        timestamps: true,
    }
);

export const Playlist = mongoose.model('Playlist', playlistSchema);
