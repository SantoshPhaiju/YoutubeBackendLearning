import mongoose from 'mongoose';

const searchSchema = new mongoose.Schema(
    {
        query: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },

        count: {
            type: Number,
            default: 1,
        },

        searchedBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],

        lastSearched: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

export const Search = mongoose.model('Search', searchSchema);
