import type { z } from 'zod';
import {
  createUserResponseSchema,
  createUserSchema,
  getUsersQuerySchema,
  getUsersResponseSchema,
  userListItemSchema,
} from '../schemas/users.js';

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type CreateUserResponse = z.infer<typeof createUserResponseSchema>;
export type GetUsersQueryInput = z.infer<typeof getUsersQuerySchema>;
export type UserListItem = z.infer<typeof userListItemSchema>;
export type GetUsersResponse = z.infer<typeof getUsersResponseSchema>;
