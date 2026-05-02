import { Router } from 'express';
import { login, logout, me } from '../../../controllers/auth/index.js';
import { authMiddleware } from '../../../middlewares/auth.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';

const authRouter = Router();

authRouter.post('/login', asyncHandler(login));
authRouter.get('/me', authMiddleware, asyncHandler(me));
authRouter.post('/logout', asyncHandler(logout));

export default authRouter;
