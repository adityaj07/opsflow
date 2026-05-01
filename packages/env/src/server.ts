import 'dotenv/config';
import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    CORS_ORIGIN: z.url(),
    JWT_TOKEN_SECRET: z.string().min(1),
    ADMIN_EMAIL: z.email().optional(),
    ADMIN_PASSWORD: z.string().min(8).optional(),
    ADMIN_NAME: z.string().optional(),
    SEED_ADMIN_FORCE: z.enum(['true', 'false']).optional(),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
