import { AppError } from '../../utils/apiError.js';
import { StatusCodes } from '../../utils/statusCodes.js';
import { userRoleSchema, type UserRole } from '@opsflow/shared';
import type { Request } from 'express';

export const toIsoOrNull = (date: Date | null): string | null => (date ? date.toISOString() : null);

export const checkAuthenticated = (req: Request) => {
  if (!req.user) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Unauthorized');
  }
  return req.user;
};

export const getActorRole = (role: string): UserRole => {
  const parsedRole = userRoleSchema.safeParse(role);
  if (!parsedRole.success) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Unauthorized');
  }
  return parsedRole.data;
};
