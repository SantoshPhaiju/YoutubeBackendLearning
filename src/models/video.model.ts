import mongoose from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const videoSchema = new mongoose.Schema(
    {
        videoFile: {
            type: String,
            required: true,
        },
        thumbnail: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        viewCount: {
            type: Number,
            default: 0,
        },
        likeCount: {
            type: Number,
            default: 0,
        },
        dislikeCount: {
            type: Number,
            default: 0,
        },
        tags: [
            {
                type: String,
                lowercase: true,
                index: true,
            },
        ],
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            index: true,
        },
        duration: {
            type: Number,
            required: true,
        },
        isPublished: {
            type: Boolean,
            default: true,
        },
        visibility: {
            type: String,
            enum: ['public', 'private'],
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

videoSchema.plugin(mongooseAggregatePaginate);
videoSchema.index({ title: 'text', description: 'text', tags: 'text' });

export const Video = mongoose.model('Video', videoSchema);
