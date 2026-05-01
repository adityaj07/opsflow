import { z } from 'zod';

// request schemas
export const signInSchema = z.object({
  email: z.email('Invalid email address').trim().toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const signUpSchema = signInSchema.extend({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
});

export const authUserSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.email(),
  role: z.string().min(1),
});

export const authSessionSchema = z.object({
  user: authUserSchema,
  accessToken: z.string().min(1),
});

// response schemas
export const signupResponseSchema = authSessionSchema;
export const loginResponseSchema = authSessionSchema;

export const meResponseSchema = z.object({
  user: authUserSchema,
});

export const logoutResponseSchema = z.object({
  loggedOut: z.literal(true),
});
