import { Router } from 'express';
import {
  assignTask,
  changeTaskStatus,
  createTask,
  getTaskById,
  getTasks,
  updateTask,
} from '@/controllers/tasks';
import { authMiddleware } from '@/middlewares/auth';
import { requireRole } from '@/middlewares/rbac';
import { asyncHandler } from '@/utils/asyncHandler';

const tasksRouter = Router();

tasksRouter.use(authMiddleware);

tasksRouter.post('/', requireRole('MANAGER', 'ADMIN'), asyncHandler(createTask));
tasksRouter.get('/', asyncHandler(getTasks));
tasksRouter.get('/:taskId', asyncHandler(getTaskById));
tasksRouter.patch('/:taskId', requireRole('MANAGER', 'ADMIN'), asyncHandler(updateTask));
tasksRouter.patch('/:taskId/assign', requireRole('MANAGER', 'ADMIN'), asyncHandler(assignTask));
tasksRouter.patch('/:taskId/status', asyncHandler(changeTaskStatus));

export default tasksRouter;
