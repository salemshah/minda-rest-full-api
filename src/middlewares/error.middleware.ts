import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import CustomError from '../utils/customError';
import { Prisma } from '@prisma/client';

// Enhanced error handler middleware
const errorHandler = (
  err:
    | CustomError
    | Prisma.PrismaClientKnownRequestError
    | Prisma.PrismaClientValidationError
    | Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  // Default status code and message
  let statusCode = 500;
  let message = 'Internal Server Error';

  // Classify the error and set status code and message accordingly
  if (err instanceof CustomError) {
    // Custom application error
    statusCode = err.statusCode || 500;
    message = err.message;
  }

  logger.error({
    message,
    statusCode,
    stack: err.stack,
    route: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  // Send error response to client
  res.status(statusCode).json({
    success: false,
    statusCode,

    message,
    // Include stack trace only in development mode
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;
