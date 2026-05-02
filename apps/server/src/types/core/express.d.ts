import type { AuthPayload } from '../../lib/auth/jwt.js';

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}
