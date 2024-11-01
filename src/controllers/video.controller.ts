import { Request, Response } from 'express';
import { ApiResponse } from '../utils/ApiResponse';
import asyncWrapper from '../utils/asyncWrapper';

export const uploadVideo = asyncWrapper(async (req: Request, res: Response) => {
    console.log('req.files', req.files);
    console.log('req.body', req.body);

    const { title, description, videoPrivacy } = req.body;

    if (![title, description, videoPrivacy].every((item) => !!item)) {
        throw new Error('Please provide all fields');
    }

    // Todo: Take Video file and thumbnail file and upload to cloudinary
    // Todo: If there is an error, delete the uploaded files
    // Todo: Save the video details to the database
    // Todo: Return the video details in the response

    res.status(201).json(
        new ApiResponse(201, 'Video uploaded successfully', {})
    );
});
