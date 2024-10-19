import { Request, Response } from 'express';
import asyncWrapper from '../utils/asyncWrapper';

export const registerUser = asyncWrapper(
    async (req: Request, res: Response) => {
        res.status(201).json({
            message: 'User registered successfully',
            status: 'success',
            data: {
                username: 'john_doe',
                email: 'hehe@gmail.com',
            },
        });
    }
);
