import {Request, Response, NextFunction, RequestHandler} from 'express';
import {ZodSchema} from 'zod';

export const validate = (schema: ZodSchema): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction) => {
        const parseResult = schema.safeParse(req.body);

        if (!parseResult.success) {
            const errors = parseResult.error.errors.map(err => err.message);
            return res.status(400).json({errors});
        }
        req.body = parseResult.data;

        next();
    };
};
