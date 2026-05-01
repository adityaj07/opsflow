import { type Request, type Response, type NextFunction } from 'express';

import { StatusCodes } from '@/utils/statusCodes';

import { AppError } from '@/utils/apiError';
import { ZodError } from 'zod';
import { logger } from './logger';

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  // Operational errors
  if (err instanceof AppError) {
    logger.warn(err.message);

    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  if (err instanceof ZodError) {
    const firstIssue = err.issues[0];
    const message = firstIssue?.message || 'Invalid request payload';
    logger.warn(message);

    return res.status(StatusCodes.BAD_REQUEST.code).json({
      success: false,
      message,
    });
  }

  // Unknown / programming errors
  logger.error('Unhandled error', err);

  return res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
    success: false,
    message: 'Something went wrong',
  });
};
