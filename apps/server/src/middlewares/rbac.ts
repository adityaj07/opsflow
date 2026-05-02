import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/apiError.js';
import { StatusCodes } from '../utils/statusCodes.js';
import type { UserRole } from '@opsflow/shared';

export const requireRole = (...allowedRoles: UserRole[]) => {
  const normalizedAllowedRoles = new Set(
    allowedRoles.map(role => role.trim()).filter(role => role.length > 0),
  );

  if (normalizedAllowedRoles.size === 0) {
    throw new Error('requireRole middleware requires at least one role');
  }

  return (req: Request, _res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return next(new AppError(StatusCodes.UNAUTHORIZED, 'Unauthorized'));
    }

    if (!normalizedAllowedRoles.has(user.role)) {
      return next(new AppError(StatusCodes.FORBIDDEN, 'You do not have access to this resource'));
    }

    next();
  };
};
