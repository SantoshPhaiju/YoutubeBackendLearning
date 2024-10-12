import { NextFunction, Request, Response } from 'express';

const asyncWrapper = (
    requestHandler: (
        req: Request,
        res: Response,
        next: NextFunction
    ) => Promise<void>
) => {
    (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(requestHandler(req, res, next)).catch((error) => {
            next(error);
        });
    };
};

export default asyncWrapper;

// const asyncWrapper = () => {};
// const asyncWrapper = (func) => {() => {}};
// const asyncWrapper = (func) => () => {};
// const asyncWrapper = (func) => async () => {};

// interface AsyncFunction {
//     (req: Request, res: Response, next: NextFunction): Promise<void>;
// }

// const asyncWrapper =
//     (fn: AsyncFunction) =>
//     async (req: Request, res: Response, next: NextFunction) => {
//         try {
//             await fn(req, res, next);
//         } catch (error: any) {
//             res.status(500).json({
//                 success: false,
//                 message: error?.message,
//             });
//         }
//     };
