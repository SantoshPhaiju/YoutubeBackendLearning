import mongoose, { Schema } from 'mongoose';

const categorySchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        tags: [
            {
                type: String,
                lowercase: true,
            },
        ],
    },
    { timestamps: true }
);

export const Category =  mongoose.model('Category', categorySchema);
