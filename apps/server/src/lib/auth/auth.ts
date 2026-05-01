import { AppError } from '@/utils/apiError';
import { StatusCodes } from '@/utils/statusCodes';
import type { Request } from 'express';
import { type AuthPayload, verifyToken } from './jwt';
import { AUTH_COOKIE_NAME } from '@/constants/auth';

type RequestWithCookies = Request & {
  cookies?: Record<string, string | undefined>;
};

export const extractToken = (req: Request) => {
  const authHeader = req.headers.authorization;
  const cookies = (req as RequestWithCookies).cookies;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    if (token) {
      return token;
    }
  }

  const cookieToken = cookies?.[AUTH_COOKIE_NAME];

  if (cookieToken) {
    return cookieToken;
  }

  throw new AppError(StatusCodes.UNAUTHORIZED, 'Authentication token missing');
};

export const authenticateRequest = (req: Request): AuthPayload => {
  const token = extractToken(req);

  try {
    return verifyToken(token);
  } catch {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid or expired access token');
  }
};
