import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

interface CustomError extends Error {
    statusCode?: number;
    errors?: any;
}

export const errorHandlerMiddleware = (
    err: CustomError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // if (req.file) {
    //     const file = req.file as Express.Multer.File;
    //     const filePath = path.join(
    //         __dirname,
    //         '../',
    //         '../',
    //         'public',
    //         'temp',
    //         file.filename
    //     );

    //     fs.unlink(filePath, (err) => {
    //         if (err) {
    //             console.error(`Failed to remove file: ${filePath}`, err);
    //         } else {
    //             console.log(`Successfully removed file: ${filePath}`);
    //         }
    //     });
    // }

    // if (req.files) {
    //     const files = req.files as {
    //         [fieldname: string]: Express.Multer.File[];
    //     };

    //     // Iterate over all files and remove them
    //     Object.keys(files).forEach((fieldName) => {
    //         files[fieldName].forEach((file) => {
    //             const filePath = path.join(
    //                 __dirname,
    //                 '../',
    //                 '../',
    //                 'public',
    //                 'temp',
    //                 file.filename
    //             ); // Adjust the path as needed
    //             fs.unlink(filePath, (err) => {
    //                 if (err) {
    //                     console.error(
    //                         `Failed to remove file: ${filePath}`,
    //                         err
    //                     );
    //                 } else {
    //                     console.log(`Successfully removed file: ${filePath}`);
    //                 }
    //             });
    //         });
    //     });
    // }
    console.log('error', err);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message,
        data: {
            errors: err?.errors,
        },
    });
};
