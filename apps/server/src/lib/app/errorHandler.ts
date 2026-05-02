import { type Request, type Response, type NextFunction } from 'express';

import { StatusCodes } from '@/utils/statusCodes';

import { AppError } from '@/utils/apiError';
import { ZodError } from 'zod';
import { logger } from './logger.js';

const formatValidationIssueMessage = (issue: ZodError['issues'][number]) => {
  const field = issue.path.length > 0 ? issue.path.join('.') : 'request';

  if (issue.code === 'invalid_type' && 'received' in issue && issue.received === 'undefined') {
    return `${field} is required`;
  }

  if (issue.code === 'invalid_type') {
    return `${field} has invalid type`;
  }

  return issue.message || `${field} is invalid`;
};

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  // Operational errors
  if (err instanceof AppError) {
    logger.warn(err.message);

    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details !== undefined ? { errors: err.details } : {}),
    });
  }

  if (err instanceof ZodError) {
    const firstIssue = err.issues[0];
    const message = firstIssue ? formatValidationIssueMessage(firstIssue) : 'Invalid request payload';
    logger.warn(message);

    return res.status(StatusCodes.BAD_REQUEST.code).json({
      success: false,
      message,
      errors: err.issues.map((issue) => ({
        path: issue.path.join('.'),
        code: issue.code,
        message: formatValidationIssueMessage(issue),
      })),
    });
  }

  // Unknown / programming errors
  logger.error('Unhandled error', err);

  return res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
    success: false,
    message: 'Something went wrong',
  });
};
