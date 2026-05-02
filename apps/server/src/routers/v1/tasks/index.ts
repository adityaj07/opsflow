import { Router } from 'express';
import {
  assignTask,
  changeTaskStatus,
  createTask,
  createTaskUpdate,
  getTaskById,
  getTaskTimeline,
  getTaskUpdates,
  getTasks,
  updateTask,
} from '../../../controllers/tasks/index.js';
import { authMiddleware } from '../../../middlewares/auth.js';
import { requireRole } from '../../../middlewares/rbac.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';

const tasksRouter = Router();

tasksRouter.use(authMiddleware);

tasksRouter.post('/', requireRole('MANAGER', 'ADMIN'), asyncHandler(createTask));
tasksRouter.get('/', asyncHandler(getTasks));
tasksRouter.get('/:taskId', asyncHandler(getTaskById));
tasksRouter.patch('/:taskId', requireRole('MANAGER', 'ADMIN'), asyncHandler(updateTask));
tasksRouter.patch('/:taskId/assign', requireRole('MANAGER', 'ADMIN'), asyncHandler(assignTask));
tasksRouter.patch('/:taskId/status', asyncHandler(changeTaskStatus));
tasksRouter.post('/:taskId/updates', asyncHandler(createTaskUpdate));
tasksRouter.get('/:taskId/updates', asyncHandler(getTaskUpdates));
tasksRouter.get('/:taskId/timeline', asyncHandler(getTaskTimeline));

export default tasksRouter;
