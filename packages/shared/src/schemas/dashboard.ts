import { z } from 'zod';
import { userRoleSchema } from './auth.js';
import { activityActionTypeSchema } from './tasks.js';

export const dashboardOverviewResponseSchema = z.object({
  role: userRoleSchema,
  total: z.number().int().min(0),
  inProgress: z.number().int().min(0),
  done: z.number().int().min(0),
  other: z.number().int().min(0),
  tasksCreatedByMe: z.number().int().min(0),
  myTasks: z.number().int().min(0),
});

export const dashboardActivityItemSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['log', 'update']),
  taskId: z.string().min(1),
  taskTitle: z.string().min(1),
  actor: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    role: userRoleSchema,
  }),
  actionType: activityActionTypeSchema.nullable(),
  updateId: z.string().min(1).nullable(),
  summary: z.string().min(1),
  whatWasDone: z.string().nullable(),
  blockers: z.string().nullable(),
  nextSteps: z.string().nullable(),
  createdAt: z.string().datetime(),
});

export const dashboardActivityResponseSchema = z.object({
  items: z.array(dashboardActivityItemSchema),
});
