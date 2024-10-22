import { NextFunction, Request, Response, RequestHandler } from 'express';

// Wrap async functions to catch errors and forward them to the error handler
export const asyncWrapper = (fn: RequestHandler): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction) => {
        // Call the async function and pass any error to the next middleware (error handler)
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
