import type { Response } from 'express';
import { env } from '@opsflow/env/server';
import { ACCESS_TOKEN_MAX_AGE_MS, AUTH_COOKIE_NAME } from '@/constants/auth';

export const setAuthCookie = (res: Response, token: string) => {
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: ACCESS_TOKEN_MAX_AGE_MS,
    path: '/',
  });
};
