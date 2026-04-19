import { Request, Response } from 'express';
import { Video } from '../models/video.model';
import asyncWrapper from '../utils/asyncWrapper';
import { ApiResponse } from '../utils/ApiResponse';
import { Search } from '../models/search.model';
import { ApiError } from '../utils/ApiError';

type SortOption = 'relevance' | 'latest' | 'oldest' | 'views';

export const searchVideos = asyncWrapper(
    async (req: Request, res: Response) => {
        const q = req.query.q as string;
        const sort = (req.query.sort as SortOption) || 'relevance';
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;

        if (!q || q.trim() === '') {
            res.status(400).json({ message: 'Search query is required' });
            return;
        }

        try {
            const skip = (page - 1) * limit;

            // MongoDB text search
            const searchQuery = {
                $text: { $search: q },
            };

            // Sorting options
            const sortOptions: Record<SortOption, any> = {
                relevance: { score: { $meta: 'textScore' } },
                latest: { createdAt: -1 },
                oldest: { createdAt: 1 },
                views: { views: -1 },
            };

            const videos = await Video.find(searchQuery, {
                score: { $meta: 'textScore' },
            })
                .sort(sortOptions[sort])
                .skip(skip)
                .limit(limit)
                .populate('owner', 'fullname username avatar');

            const total = await Video.countDocuments(searchQuery);

            res.status(200).json(
                new ApiResponse(200, 'videos searched successfully', {
                    results: videos,
                    total,
                    page,
                    totalPages: Math.ceil(total / limit),
                })
            );
        } catch (err: any) {
            res.status(500).json({
                message: 'Search failed',
                error: err.message,
            });
        }
    }
);

export const searchSuggestions = asyncWrapper(
    async (req: Request, res: Response) => {
        const { q } = req.query;

        if (!q || typeof q !== 'string') {
            res.status(200).json(new ApiResponse(200, 'No suggestions', []));
            return;
        }

        const userId = req.user?._id || null;

        try {
            // 1️⃣ Search DB suggestions
            const searchData = await Search.aggregate([
                {
                    $match: {
                        query: { $regex: `^${q}`, $options: 'i' },
                    },
                },
                {
                    $addFields: {
                        source: 'search',
                        priority: {
                            $add: [
                                '$count',
                                {
                                    $cond: [
                                        { $eq: ['$userId', userId] },
                                        1000,
                                        0,
                                    ],
                                },
                            ],
                        },
                    },
                },
                {
                    $project: {
                        text: '$query',
                        priority: 1,
                        source: 1,
                    },
                },
            ]);

            // 2️⃣ Video suggestions
            const videoData = await Video.find({
                title: { $regex: q, $options: 'i' },
            })
                .limit(10)
                .select('title viewCount');
            console.log('videoData', videoData);

            const formattedVideos = videoData.map((v) => ({
                text: v.title,
                priority: v.viewCount || 0,
                source: 'video',
            }));

            // 3️⃣ Merge both
            const combined = [...searchData, ...formattedVideos];

            // 4️⃣ Deduplicate (important)
            const map = new Map();

            for (const item of combined) {
                const key = item.text.toLowerCase();

                if (!map.has(key)) {
                    map.set(key, item);
                } else {
                    // keep higher priority one
                    if (item.priority > map.get(key).priority) {
                        map.set(key, item);
                    }
                }
            }


            // 5️⃣ Final sorted result
            const finalSuggestions = Array.from(map.values())
                .sort((a, b) => b.priority - a.priority)
                .slice(0, 12)
                .map((i) => ({ query: i.text }));

            res.status(200).json(
                new ApiResponse(
                    200,
                    'Suggestions fetched successfully',
                    finalSuggestions
                )
            );
        } catch (err: any) {
            res.status(500).json(
                new ApiError(500, 'Failed to fetch suggestions', err.message)
            );
        }
    }
);

export const saveSuggestion = asyncWrapper(
    async (req: Request, res: Response) => {
        const query = req.query.q as string;
        if (!query || query.trim() === '') {
            res.status(400).json({ message: 'Query is required' });
            return;
        }

        const userId = req.user._id || null;

        const normalized = query.toLowerCase().trim();

        const existingQuery = await Search.findOne({ query: normalized });

        if (existingQuery) {
            existingQuery.count += 1;
            existingQuery.lastSearched = new Date();
            await existingQuery.save();
        } else {
            await Search.create({
                query: normalized,
                userId: userId,
                count: 1,
                lastSearched: new Date(),
            });
        }

        res.status(200).json(
            new ApiResponse(200, 'Suggestion saved successfully', null)
        );
    }
);
