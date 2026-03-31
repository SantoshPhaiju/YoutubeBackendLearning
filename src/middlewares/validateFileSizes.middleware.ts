import fs from 'fs';
import { Request, Response, NextFunction } from 'express';

export const validateFileSizes = (req: Request, res: Response, next: NextFunction) => {
    try {
        const files = req.files as {
            [fieldname: string]: Express.Multer.File[];
        };

        if (files?.videoFile?.[0]) {
            const video = files.videoFile[0];

            if (video.size > 100 * 1024 * 1024) {
                fs.unlinkSync(video.path);
                return next(new Error('Video exceeds 100MB limit'));
            }
        }

        if (files?.thumbnail?.[0]) {
            const thumbnail = files.thumbnail[0];

            if (thumbnail.size > 5 * 1024 * 1024) {
                fs.unlinkSync(thumbnail.path);
                return next(new Error('Thumbnail exceeds 5MB limit'));
            }
        }

        next();
    } catch (err) {
        next(err);
    }
};
