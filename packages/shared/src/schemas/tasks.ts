import { z } from 'zod';
import { userRoleSchema } from './auth';

export const taskStatusSchema = z.enum([
  'BACKLOG',
  'TODO',
  'IN_PROGRESS',
  'DONE',
  'CANCELED',
  'DUPLICATE',
]);

export const taskPrioritySchema = z.enum(['HIGH', 'MEDIUM', 'LOW']);

export const taskUserSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.email(),
  role: userRoleSchema,
});

export const taskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().nullable(),
  status: taskStatusSchema,
  priority: taskPrioritySchema,
  createdById: z.string().min(1),
  assignedToId: z.string().min(1),
  dueDate: z.string().datetime().nullable(),
  lastActivityAt: z.string().datetime(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdByName: z.string().min(1).optional(),
  assignedToName: z.string().min(1).optional(),
});

export const taskWithUsersSchema = taskSchema.extend({
  createdBy: taskUserSchema,
  assignedTo: taskUserSchema,
});

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().trim().max(5000, 'Description is too long').optional(),
  assignedToId: z.string().min(1, 'assignedToId is required'),
  priority: taskPrioritySchema.optional(),
  dueDate: z.string().datetime('dueDate must be a valid ISO datetime').optional(),
});

export const getTasksQuerySchema = z.object({
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  assignedToId: z.string().min(1).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1, 'Title cannot be empty').max(200, 'Title is too long').optional(),
    description: z.string().trim().max(5000, 'Description is too long').optional(),
    priority: taskPrioritySchema.optional(),
    dueDate: z.string().datetime('dueDate must be a valid ISO datetime').nullable().optional(),
  })
  .refine(data => Object.keys(data).length > 0, {
    message: 'At least one field is required to update',
  });

export const assignTaskSchema = z.object({
  assignedToId: z.string().min(1, 'assignedToId is required'),
});

export const changeTaskStatusSchema = z.object({
  status: taskStatusSchema,
});

export const createTaskUpdateSchema = z.object({
  whatWasDone: z
    .string()
    .trim()
    .min(1, 'whatWasDone is required')
    .max(5000, 'whatWasDone is too long'),
  blockers: z.string().trim().max(5000, 'blockers is too long').optional(),
  nextSteps: z.string().trim().max(5000, 'nextSteps is too long').optional(),
  status: taskStatusSchema.optional(),
});

export const taskUpdateSchema = z.object({
  id: z.string().min(1),
  taskId: z.string().min(1),
  userId: z.string().min(1),
  status: taskStatusSchema.nullable(),
  whatWasDone: z.string().min(1),
  blockers: z.string().nullable(),
  nextSteps: z.string().nullable(),
  createdAt: z.string().datetime(),
});

export const taskUpdateWithUserSchema = taskUpdateSchema.extend({
  user: taskUserSchema,
});

export const activityActionTypeSchema = z.enum([
  'TASK_CREATED',
  'TASK_ASSIGNED',
  'STATUS_CHANGED',
  'TASK_UPDATED',
]);

export const timelineLogEntrySchema = z.object({
  type: z.literal('log'),
  createdAt: z.string().datetime(),
  log: z.object({
    id: z.string().min(1),
    actionType: activityActionTypeSchema,
    metadata: z.unknown(),
    user: taskUserSchema,
  }),
});

export const timelineUpdateEntrySchema = z.object({
  type: z.literal('update'),
  createdAt: z.string().datetime(),
  update: taskUpdateWithUserSchema,
});

export const taskTimelineEntrySchema = z.union([timelineLogEntrySchema, timelineUpdateEntrySchema]);

export const createTaskResponseSchema = taskSchema;
export const getTaskByIdResponseSchema = taskWithUsersSchema;
export const updateTaskResponseSchema = taskSchema;
export const assignTaskResponseSchema = taskSchema;
export const changeTaskStatusResponseSchema = taskSchema;
export const createTaskUpdateResponseSchema = taskUpdateWithUserSchema;
export const getTaskUpdatesResponseSchema = z.object({
  updates: z.array(taskUpdateWithUserSchema),
});
export const getTaskTimelineResponseSchema = z.object({
  items: z.array(taskTimelineEntrySchema),
});

export const getTasksResponseSchema = z.object({
  data: z.array(taskSchema),
  pagination: z.object({
    page: z.number().int().min(1),
    limit: z.number().int().min(1),
    total: z.number().int().min(0),
  }),
});
