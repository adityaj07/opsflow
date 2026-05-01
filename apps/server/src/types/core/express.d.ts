import type { AuthPayload } from '@/lib/auth/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}
