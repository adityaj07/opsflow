import { Router } from 'express';
import { createUser, getUsers } from '../../../controllers/users/index.js';
import { authMiddleware } from '../../../middlewares/auth.js';
import { requireRole } from '../../../middlewares/rbac.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';

const usersRouter = Router();

usersRouter.use(authMiddleware);

usersRouter.get('/', requireRole('ADMIN', 'MANAGER'), asyncHandler(getUsers));
usersRouter.post('/', requireRole('ADMIN'), asyncHandler(createUser));

export default usersRouter;
