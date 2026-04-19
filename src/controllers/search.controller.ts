import { Request, Response } from 'express';
import { Video } from '../models/video.model';
import asyncWrapper from '../utils/asyncWrapper';
import { ApiResponse } from '../utils/ApiResponse';

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
        if (!q) {
            res.status(200).json(
                new ApiResponse(200, 'No suggestions available', null)
            );
            return;
        }

        try {
            const suggestions = await Video.find(
                { title: { $regex: q, $options: 'i' } },
                { title: 1 }
            ).limit(8);

            res.status(200).json(
                new ApiResponse(
                    200,
                    'Suggestions fetched successfully',
                    suggestions.map((v) => ({ id: v._id, title: v.title }))
                )
            );
        } catch (err) {
            res.status(500).json({ message: 'Error fetching suggestions' });
        }
    }
);
