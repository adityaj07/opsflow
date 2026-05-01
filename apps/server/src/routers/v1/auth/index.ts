import { Router } from 'express';
import { login, logout, me, signup } from '@/controllers/auth';
import { authMiddleware } from '@/middlewares/auth';
import { asyncHandler } from '@/utils/asyncHandler';

const authRouter = Router();

authRouter.post('/signup', asyncHandler(signup));
authRouter.post('/login', asyncHandler(login));
authRouter.get('/me', authMiddleware, asyncHandler(me));
authRouter.post('/logout', asyncHandler(logout));

export default authRouter;
