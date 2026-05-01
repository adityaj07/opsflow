import type { AuthPayload } from '@/lib/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}
