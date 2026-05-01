import type { z } from 'zod';
import { createUserResponseSchema, createUserSchema } from '../schemas/users';

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type CreateUserResponse = z.infer<typeof createUserResponseSchema>;
