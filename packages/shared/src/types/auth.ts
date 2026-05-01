import type { z } from 'zod';

import {
  authUserSchema,
  loginResponseSchema,
  logoutResponseSchema,
  meResponseSchema,
  signInSchema,
  signupResponseSchema,
  signUpSchema,
} from '../schemas/auth';

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type AuthUser = z.infer<typeof authUserSchema>;

// response types
export type SignupResponse = z.infer<typeof signupResponseSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type MeResponse = z.infer<typeof meResponseSchema>;
export type LogoutResponse = z.infer<typeof logoutResponseSchema>;
