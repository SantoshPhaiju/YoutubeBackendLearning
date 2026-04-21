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

const getTokenFromRequest = (req: Request): string | undefined => {
    return (
        req.header('Authorization')?.replace('Bearer ', '') ||
        req?.cookies.accessToken
    );
};

const verifyAndAttachUser = async (token: string) => {
    const decodedUserData = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET!
    ) as JwtPayload;

    const user = await User.findById(decodedUserData.id);

    if (!user) {
        throw new ApiError(401, 'Invalid access token');
    }

    return user;
};

const verifyJWT = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = getTokenFromRequest(req);

        if (!token) {
            return next(new ApiError(401, 'Unauthorized request'));
        }

        req.user = await verifyAndAttachUser(token);
        next();
    } catch (error: any) {
        console.error('JWT Verification Error:', error);
        next(new ApiError(401, error?.message || 'Unauthorized request'));
    }
};

export const optionalVerifyJWT = async (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    try {
        const token = getTokenFromRequest(req);

        if (!token) {
            return next();
        }

        req.user = await verifyAndAttachUser(token);
        next();
    } catch {
        // Ignore invalid token on optional auth routes; treat as guest.
        next();
    }
};

export default verifyJWT;
