import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { logger } from '../lib/app/logger.js';

const isProd = process.env.NODE_ENV === 'production';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  if (req.path === '/health') return next();

  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - startTime;

    if (!isProd) {
      console.log(
        `${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms` +
          (req.user?.userId ? ` user=${req.user.userId}` : ''),
      );
    } else {
      logger.info('HTTP request', {
        requestId,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs,
        userId: req.user?.userId,
      });
    }
  });

  next();
};
