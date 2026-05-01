import jwt from 'jsonwebtoken';
import { env } from '@opsflow/env/server';

export type AuthPayload = {
  userId: string;
  role: string;
};

export const AUTH_COOKIE_NAME = 'accessToken';

export const signToken = (payload: AuthPayload): string => {
  return jwt.sign(payload, env.JWT_TOKEN_SECRET);
};

export const verifyToken = (token: string): AuthPayload => {
  return jwt.verify(token, env.JWT_TOKEN_SECRET) as AuthPayload;
};
