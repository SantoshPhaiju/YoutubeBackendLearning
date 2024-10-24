import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { ApiError } from '../utils/ApiError';

interface JwtPayload {
    id: string;
    email: string;
    username: string;
    fullname: string;
    iat: number;
    exp: number;
}

const verifyJWT = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token: string =
            req.header('Authorization')?.replace('Bearer ', '') ||
            req?.cookies.accessToken;

        if (!token) {
            return next(new ApiError(401, 'Unauthorized request'));
        }

        const decodedUserData = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET!
        ) as JwtPayload;

        const user = await User.findById(decodedUserData.id).select(
            '-password -refreshToken'
        );

        if (!user) {
            return next(new ApiError(401, 'Invalid access token'));
        }

        req.user = user;
        next();
    } catch (error: any) {
        console.error('JWT Verification Error:', error); // Log the error
        next(new ApiError(401, error?.message || 'Unauthorized request')); // Pass the error to next
    }
};

export default verifyJWT;
