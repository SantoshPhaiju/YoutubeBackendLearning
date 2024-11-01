import { Request, Response } from 'express';
import { ApiResponse } from '../utils/ApiResponse';
import asyncWrapper from '../utils/asyncWrapper';

export const uploadVideo = asyncWrapper(async (req: Request, res: Response) => {
    console.log('req.file', req.file);
    console.log('req.body', req.body);

    const { title, description, videoPrivacy } = req.body;

    if (![title, description, videoPrivacy].every((item) => !!item)) {
        throw new Error('Please provide all fields');
    }

    res.status(201).json(
        new ApiResponse(201, 'Video uploaded successfully', {})
    );
});
