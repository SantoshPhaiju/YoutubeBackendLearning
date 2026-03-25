import mongoose from 'mongoose';
import extractTags from './extractTags';
import { Category } from '../models/category.model';

interface DetectCategoryOptions {
    title: string;
    description: string;
}

// Main function: returns categoryId instead of name
export async function detectCategory({
    title,
    description,
}: DetectCategoryOptions): Promise<mongoose.Types.ObjectId> {
    // 1️⃣ Extract tags from title + description
    const tags = extractTags(title, description); // combine for better matching

    // 2️⃣ Fetch all categories from DB
    const categories = await Category.find(); // [{ _id, name, tags: [] }]

    // 3️⃣ Find best match
    let bestCategoryId: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(); // default to new id (optional)
    let maxMatches = 0;

    for (const category of categories) {
        const matchCount = tags.filter((tag) =>
            category.tags.includes(tag)
        ).length;
        if (matchCount > maxMatches) {
            maxMatches = matchCount;
            bestCategoryId = category._id;
        }
    }

    // 4️⃣ If no match, optionally pick "general" category
    if (maxMatches === 0) {
        const generalCategory = await Category.findOne({ name: 'general' });
        if (generalCategory) bestCategoryId = generalCategory._id;
    }

    return bestCategoryId;
}
