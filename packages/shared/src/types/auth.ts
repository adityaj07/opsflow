import type { z } from 'zod';

import { signInSchema, signUpSchema } from '../schemas/auth';

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
