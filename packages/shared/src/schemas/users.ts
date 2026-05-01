import { z } from 'zod';
import { authUserSchema, userRoleSchema } from './auth';

export const createUserSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  email: z.email('Invalid email address').trim().toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: userRoleSchema,
});

export const createUserResponseSchema = z.object({
  user: authUserSchema,
});
