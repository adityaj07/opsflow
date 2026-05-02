import { z } from 'zod';
import { authUserSchema, userRoleSchema } from './auth.js';

export const createUserSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  email: z.email('Invalid email address').trim().toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: userRoleSchema,
});

export const createUserResponseSchema = z.object({
  user: authUserSchema,
});

export const getUsersQuerySchema = z.object({
  role: userRoleSchema.optional(),
});

export const userListItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.email(),
  role: userRoleSchema,
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
});

export const getUsersResponseSchema = z.object({
  users: z.array(userListItemSchema),
});
