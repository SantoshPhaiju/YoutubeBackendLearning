import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import fs from 'fs';
import path from 'path';

export const handleValidationErrors = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        if (req.file) {
            const file = req.file as Express.Multer.File;
            const filePath = path.join(
                __dirname,
                '../',
                '../',
                'public',
                'temp',
                file.filename
            );

            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error(`Failed to remove file: ${filePath}`, err);
                } else {
                    console.log(`Successfully removed file: ${filePath}`);
                }
            });
        }

        if (req.files) {
            console.log('inerror', req.files);
            const files = req.files as {
                [fieldname: string]: Express.Multer.File[];
            };

            // Iterate over all files and remove them
            Object.keys(files).forEach((fieldName) => {
                files[fieldName].forEach((file) => {
                    const filePath = path.join(
                        __dirname,
                        '../',
                        '../',
                        'public',
                        'temp',
                        file.filename
                    ); // Adjust the path as needed
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            console.error(
                                `Failed to remove file: ${filePath}`,
                                err
                            );
                        } else {
                            console.log(
                                `Successfully removed file: ${filePath}`
                            );
                        }
                    });
                });
            });
        }

        const customError = errors.array()[0].msg;
        const status = customError.statusCode || 400; // Default to 400 if no statusCode
        const message = customError.message || customError;
        res.status(parseInt(status)).json({
            success: false,
            message: message,
            data: {
                errors: errors.array(),
            },
        });
    } else {
        next();
    }
};
