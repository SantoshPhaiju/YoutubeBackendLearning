import mongoose from 'mongoose';
import { Like } from '../models/like.model';

export const getReactionMap = async (
    commentIds: mongoose.Types.ObjectId[],
    userId?: mongoose.Types.ObjectId
) => {
    if (!userId) {
        return new Map<string, 'like' | 'dislike'>();
    }

    const reactions = await Like.find({
        likedBy: userId,
        comment: { $in: commentIds },
    })
        .select('comment type')
        .lean();

    const reactionMap = new Map<string, 'like' | 'dislike'>();

    reactions.forEach((reaction) => {
        reactionMap.set(reaction.comment.toString(), reaction.type);
    });

    return reactionMap;
};
