import type { NextFunction, Request, Response } from 'express';
import { authenticateRequest } from '@/lib/auth';

export const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  try {
    req.user = authenticateRequest(req);
    next();
  } catch (error) {
    next(error);
  }
};
