import { Request, Response, NextFunction } from 'express';
import { httpRequestDurationHistogram } from '../metrics/metrics';

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const end = httpRequestDurationHistogram.startTimer();
    res.on('finish', () => {
        end({ method: req.method, route: req.route?.path || req.originalUrl, status_code: res.statusCode });
    });
    next();
};
