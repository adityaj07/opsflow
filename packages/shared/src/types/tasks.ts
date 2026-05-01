import type { z } from 'zod';
import {
  assignTaskResponseSchema,
  assignTaskSchema,
  changeTaskStatusResponseSchema,
  changeTaskStatusSchema,
  createTaskUpdateResponseSchema,
  createTaskUpdateSchema,
  createTaskResponseSchema,
  createTaskSchema,
  getTaskByIdResponseSchema,
  getTasksQuerySchema,
  getTaskUpdatesResponseSchema,
  getTasksResponseSchema,
  taskPrioritySchema,
  taskSchema,
  taskUpdateSchema,
  taskUpdateWithUserSchema,
  taskStatusSchema,
  taskUserSchema,
  taskWithUsersSchema,
  updateTaskResponseSchema,
  updateTaskSchema,
} from '../schemas/tasks';

export type TaskStatus = z.infer<typeof taskStatusSchema>;
export type TaskPriority = z.infer<typeof taskPrioritySchema>;
export type TaskUser = z.infer<typeof taskUserSchema>;
export type Task = z.infer<typeof taskSchema>;
export type TaskWithUsers = z.infer<typeof taskWithUsersSchema>;
export type TaskUpdate = z.infer<typeof taskUpdateSchema>;
export type TaskUpdateWithUser = z.infer<typeof taskUpdateWithUserSchema>;

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type GetTasksQueryInput = z.infer<typeof getTasksQuerySchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type AssignTaskInput = z.infer<typeof assignTaskSchema>;
export type ChangeTaskStatusInput = z.infer<typeof changeTaskStatusSchema>;
export type CreateTaskUpdateInput = z.infer<typeof createTaskUpdateSchema>;

export type CreateTaskResponse = z.infer<typeof createTaskResponseSchema>;
export type GetTasksResponse = z.infer<typeof getTasksResponseSchema>;
export type GetTaskByIdResponse = z.infer<typeof getTaskByIdResponseSchema>;
export type UpdateTaskResponse = z.infer<typeof updateTaskResponseSchema>;
export type AssignTaskResponse = z.infer<typeof assignTaskResponseSchema>;
export type ChangeTaskStatusResponse = z.infer<typeof changeTaskStatusResponseSchema>;
export type CreateTaskUpdateResponse = z.infer<typeof createTaskUpdateResponseSchema>;
export type GetTaskUpdatesResponse = z.infer<typeof getTaskUpdatesResponseSchema>;
