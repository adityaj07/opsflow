import { Router } from 'express';
import { createUser } from '@/controllers/users';
import { authMiddleware } from '@/middlewares/auth';
import { requireRole } from '@/middlewares/rbac';
import { asyncHandler } from '@/utils/asyncHandler';

const usersRouter = Router();

usersRouter.post('/', authMiddleware, requireRole('ADMIN'), asyncHandler(createUser));

export default usersRouter;
