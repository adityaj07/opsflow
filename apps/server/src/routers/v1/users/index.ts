import { Router } from 'express';
import { createUser, getUsers } from '@/controllers/users';
import { authMiddleware } from '@/middlewares/auth';
import { requireRole } from '@/middlewares/rbac';
import { asyncHandler } from '@/utils/asyncHandler';

const usersRouter = Router();

usersRouter.use(authMiddleware);

usersRouter.get('/', requireRole('ADMIN', 'MANAGER'), asyncHandler(getUsers));
usersRouter.post('/', requireRole('ADMIN'), asyncHandler(createUser));

export default usersRouter;
