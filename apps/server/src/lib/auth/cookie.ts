import type { Response } from 'express';

import { ACCESS_TOKEN_MAX_AGE_MS, AUTH_COOKIE_NAME } from '../../constants/auth.js';

export const setAuthCookie = (res: Response, token: string) => {
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: ACCESS_TOKEN_MAX_AGE_MS,
    path: '/',
  });
};
