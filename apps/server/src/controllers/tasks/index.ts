import prisma from '@opsflow/db';
import {
  assignTaskSchema,
  changeTaskStatusSchema,
  createTaskUpdateSchema,
  createTaskSchema,
  getTasksQuerySchema,
  updateTaskSchema,
} from '@opsflow/shared';
import type {
  AssignTaskResponse,
  ChangeTaskStatusResponse,
  CreateTaskUpdateResponse,
  CreateTaskResponse,
  GetTaskByIdResponse,
  GetTaskTimelineResponse,
  GetTaskUpdatesResponse,
  GetTasksResponse,
  TaskStatus,
  TaskTimelineEntry,
  TaskUpdateWithUser,
  UpdateTaskResponse,
  UserRole,
} from '@opsflow/shared';
import type { Request, Response } from 'express';
import { AppError } from '@/utils/apiError';
import { successResponse } from '@/utils/apiResponse';
import { StatusCodes } from '@/utils/statusCodes';
import { canAccessTask, getRouteParam } from '@/lib/tasks';
import { checkAuthenticated, getActorRole, toIsoOrNull } from '@/lib/app';

const serializeTask = (task: {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  createdById: string;
  assignedToId: string;
  dueDate: Date | null;
  lastActivityAt: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: { name: string } | null;
  assignedTo?: { name: string } | null;
}) => ({
  id: task.id,
  title: task.title,
  description: task.description,
  status: task.status,
  priority: task.priority,
  createdById: task.createdById,
  assignedToId: task.assignedToId,
  dueDate: toIsoOrNull(task.dueDate),
  lastActivityAt: task.lastActivityAt.toISOString(),
  createdAt: task.createdAt.toISOString(),
  updatedAt: task.updatedAt.toISOString(),
  ...(task.createdBy?.name ? { createdByName: task.createdBy.name } : {}),
  ...(task.assignedTo?.name ? { assignedToName: task.assignedTo.name } : {}),
});

const serializeTaskUpdate = (taskUpdate: {
  id: string;
  taskId: string;
  userId: string;
  status: TaskStatus | null;
  whatWasDone: string;
  blockers: string | null;
  nextSteps: string | null;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}): TaskUpdateWithUser => ({
  id: taskUpdate.id,
  taskId: taskUpdate.taskId,
  userId: taskUpdate.userId,
  status: taskUpdate.status,
  whatWasDone: taskUpdate.whatWasDone,
  blockers: taskUpdate.blockers,
  nextSteps: taskUpdate.nextSteps,
  createdAt: taskUpdate.createdAt.toISOString(),
  user: {
    id: taskUpdate.user.id,
    name: taskUpdate.user.name,
    email: taskUpdate.user.email,
    role: taskUpdate.user.role as UserRole,
  },
});

const serializeTimelineLog = (log: {
  id: string;
  actionType: 'TASK_CREATED' | 'TASK_ASSIGNED' | 'STATUS_CHANGED' | 'TASK_UPDATED';
  metadata: unknown;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}): TaskTimelineEntry => ({
  type: 'log',
  createdAt: log.createdAt.toISOString(),
  log: {
    id: log.id,
    actionType: log.actionType,
    metadata: log.metadata,
    user: {
      id: log.user.id,
      name: log.user.name,
      email: log.user.email,
      role: log.user.role as UserRole,
    },
  },
});

const isTaskUpdateGeneratedLog = (metadata: unknown) => {
  if (!metadata || typeof metadata !== 'object') return false;
  const source = (metadata as Record<string, unknown>).source;
  return source === 'task_update';
};

export const createTask = async (req: Request, res: Response) => {
  const actor = checkAuthenticated(req);

  const parsedPayload = createTaskSchema.safeParse(req.body);
  if (!parsedPayload.success) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Validation failed', parsedPayload.error.issues);
  }

  const payload = parsedPayload.data;

  const assignedUser = await prisma.user.findUnique({
    where: { id: payload.assignedToId },
    select: { id: true, isActive: true },
  });

  if (!assignedUser || !assignedUser.isActive) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Assigned user does not exist or is inactive');
  }

  // here we have to create the task and activity log together in a single txn
  const task = await prisma.$transaction(async tx => {
    const createdTask = await tx.task.create({
      data: {
        title: payload.title,
        description: payload.description,
        assignedToId: payload.assignedToId,
        createdById: actor.userId,
        priority: payload.priority,
        dueDate: payload.dueDate ? new Date(payload.dueDate) : undefined,
      },
    });

    await tx.activityLog.create({
      data: {
        userId: actor.userId,
        taskId: createdTask.id,
        actionType: 'TASK_CREATED',
        metadata: {
          title: createdTask.title,
        },
      },
    });

    return createdTask;
  });

  const response: CreateTaskResponse = serializeTask(task);
  const { status, body } = successResponse<CreateTaskResponse>(
    StatusCodes.CREATED,
    'Task created successfully',
    response,
  );
  res.status(status).json(body);
};

export const getTasks = async (req: Request, res: Response) => {
  const actor = checkAuthenticated(req);
  const actorRole = getActorRole(actor.role);

  const parsedQuery = getTasksQuerySchema.safeParse(req.query);
  if (!parsedQuery.success) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Validation failed', parsedQuery.error.issues);
  }

  const { status, priority, assignedToId, page, limit } = parsedQuery.data;

  // create the where condition based upon the fields/filters
  const whereConditions: Record<string, unknown> = {};

  if (status) {
    whereConditions.status = status;
  }
  if (priority) {
    whereConditions.priority = priority;
  }
  if (assignedToId) {
    whereConditions.assignedToId = assignedToId;
  }

  if (actorRole === 'USER') {
    whereConditions.assignedToId = actor.userId;
  } else if (actorRole === 'MANAGER') {
    whereConditions.OR = [{ createdById: actor.userId }, { assignedToId: actor.userId }];
  }

  const skip = (page - 1) * limit;

  // here we have we use txn to find the count and tasks
  const [tasks, total] = await prisma.$transaction([
    prisma.task.findMany({
      where: whereConditions,
      include: {
        createdBy: { select: { name: true } },
        assignedTo: { select: { name: true } },
      },
      orderBy: { lastActivityAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.task.count({
      where: whereConditions,
    }),
  ]);

  const response: GetTasksResponse = {
    data: tasks.map(task => serializeTask(task)),
    pagination: {
      page,
      limit,
      total,
    },
  };

  const { status: statusCode, body } = successResponse<GetTasksResponse>(
    StatusCodes.OK,
    'Tasks fetched successfully',
    response,
  );
  res.status(statusCode).json(body);
};

export const getTaskById = async (req: Request, res: Response) => {
  const actor = checkAuthenticated(req);
  const actorRole = getActorRole(actor.role);
  const taskId = getRouteParam(req.params.taskId, 'taskId');

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      assignedTo: {
        select: { id: true, name: true, email: true, role: true },
      },
      createdBy: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
  });

  if (!task) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Task not found');
  }

  if (!canAccessTask(actorRole, actor.userId, task)) {
    throw new AppError(StatusCodes.FORBIDDEN, 'You do not have access to this resource');
  }

  const response: GetTaskByIdResponse = {
    ...serializeTask(task),
    assignedTo: {
      ...task.assignedTo,
      role: task.assignedTo.role as UserRole,
    },
    createdBy: {
      ...task.createdBy,
      role: task.createdBy.role as UserRole,
    },
  };

  const { status, body } = successResponse<GetTaskByIdResponse>(
    StatusCodes.OK,
    'Task fetched successfully',
    response,
  );
  res.status(status).json(body);
};

export const updateTask = async (req: Request, res: Response) => {
  const actor = checkAuthenticated(req);
  const actorRole = getActorRole(actor.role);
  const taskId = getRouteParam(req.params.taskId, 'taskId');

  const parsedPayload = updateTaskSchema.safeParse(req.body);
  if (!parsedPayload.success) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Validation failed', parsedPayload.error.issues);
  }

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { id: true, createdById: true, assignedToId: true },
  });

  if (!task) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Task not found');
  }

  if (!canAccessTask(actorRole, actor.userId, task)) {
    throw new AppError(StatusCodes.FORBIDDEN, 'You do not have access to this resource');
  }

  const payload = parsedPayload.data;
  const updatedFields = Object.keys(payload);

  // here we use txn so that task is updated and activity log is created together
  const updatedTask = await prisma.$transaction(async tx => {
    const nextTask = await tx.task.update({
      where: { id: taskId },
      data: {
        title: payload.title,
        description: payload.description,
        priority: payload.priority,
        dueDate:
          payload.dueDate === undefined
            ? undefined
            : payload.dueDate === null
              ? null
              : new Date(payload.dueDate),
        lastActivityAt: new Date(),
      },
    });

    await tx.activityLog.create({
      data: {
        userId: actor.userId,
        taskId,
        actionType: 'TASK_UPDATED',
        metadata: {
          updatedFields,
        },
      },
    });

    return nextTask;
  });

  const response: UpdateTaskResponse = serializeTask(updatedTask);
  const { status, body } = successResponse<UpdateTaskResponse>(
    StatusCodes.OK,
    'Task updated successfully',
    response,
  );
  res.status(status).json(body);
};

export const assignTask = async (req: Request, res: Response) => {
  const actor = checkAuthenticated(req);
  const actorRole = getActorRole(actor.role);
  const taskId = getRouteParam(req.params.taskId, 'taskId');

  const parsedPayload = assignTaskSchema.safeParse(req.body);
  if (!parsedPayload.success) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Validation failed', parsedPayload.error.issues);
  }

  const payload = parsedPayload.data;

  // using txn to find the task and assignedUser together
  const [task, assignedUser] = await prisma.$transaction([
    prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true, createdById: true, assignedToId: true },
    }),
    prisma.user.findUnique({
      where: { id: payload.assignedToId },
      select: { id: true, isActive: true },
    }),
  ]);

  if (!task) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Task not found');
  }

  if (!canAccessTask(actorRole, actor.userId, task)) {
    throw new AppError(StatusCodes.FORBIDDEN, 'You do not have access to this resource');
  }

  if (!assignedUser || !assignedUser.isActive) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Assigned user does not exist or is inactive');
  }

  const previousAssignedToId = task.assignedToId;

  // using txn to update the task assignment and create activity log again
  const updatedTask = await prisma.$transaction(async tx => {
    const nextTask = await tx.task.update({
      where: { id: taskId },
      data: {
        assignedToId: payload.assignedToId,
        lastActivityAt: new Date(),
      },
    });

    await tx.activityLog.create({
      data: {
        userId: actor.userId,
        taskId,
        actionType: 'TASK_ASSIGNED',
        metadata: {
          from: previousAssignedToId,
          to: payload.assignedToId,
        },
      },
    });

    return nextTask;
  });

  const response: AssignTaskResponse = serializeTask(updatedTask);
  const { status, body } = successResponse<AssignTaskResponse>(
    StatusCodes.OK,
    'Task assigned successfully',
    response,
  );
  res.status(status).json(body);
};

export const changeTaskStatus = async (req: Request, res: Response) => {
  const actor = checkAuthenticated(req);
  const actorRole = getActorRole(actor.role);
  const taskId = getRouteParam(req.params.taskId, 'taskId');

  const parsedPayload = changeTaskStatusSchema.safeParse(req.body);
  if (!parsedPayload.success) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Validation failed', parsedPayload.error.issues);
  }

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { id: true, status: true, createdById: true, assignedToId: true },
  });

  if (!task) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Task not found');
  }

  if (!canAccessTask(actorRole, actor.userId, task)) {
    throw new AppError(StatusCodes.FORBIDDEN, 'You do not have access to this resource');
  }

  const payload = parsedPayload.data;

  // using txn to reliably update the task status and create activitylog
  const updatedTask = await prisma.$transaction(async tx => {
    const nextTask = await tx.task.update({
      where: { id: taskId },
      data: {
        status: payload.status,
        lastActivityAt: new Date(),
      },
    });

    await tx.activityLog.create({
      data: {
        userId: actor.userId,
        taskId,
        actionType: 'STATUS_CHANGED',
        metadata: {
          from: task.status,
          to: payload.status,
        },
      },
    });

    return nextTask;
  });

  const response: ChangeTaskStatusResponse = serializeTask(updatedTask);
  const { status, body } = successResponse<ChangeTaskStatusResponse>(
    StatusCodes.OK,
    'Task status updated successfully',
    response,
  );
  res.status(status).json(body);
};

export const createTaskUpdate = async (req: Request, res: Response) => {
  const actor = checkAuthenticated(req);
  const actorRole = getActorRole(actor.role);
  const taskId = getRouteParam(req.params.taskId, 'taskId');

  const parsedPayload = createTaskUpdateSchema.safeParse(req.body);
  if (!parsedPayload.success) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Validation failed', parsedPayload.error.issues);
  }

  const payload = parsedPayload.data;
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: {
      id: true,
      status: true,
      createdById: true,
      assignedToId: true,
    },
  });

  if (!task) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Task not found');
  }

  if (!canAccessTask(actorRole, actor.userId, task)) {
    throw new AppError(StatusCodes.FORBIDDEN, 'You do not have access to this resource');
  }

  // using transaction to create the update, activity log aand update the update the metadata on task
  const createdUpdate = await prisma.$transaction(async tx => {
    const nextUpdate = await tx.taskUpdate.create({
      data: {
        taskId,
        userId: actor.userId,
        status: payload.status,
        whatWasDone: payload.whatWasDone,
        blockers: payload.blockers,
        nextSteps: payload.nextSteps,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    await tx.task.update({
      where: { id: taskId },
      data: {
        ...(payload.status ? { status: payload.status } : {}),
        lastActivityAt: new Date(),
      },
    });

    await tx.activityLog.create({
      data: {
        userId: actor.userId,
        taskId,
        actionType: payload.status ? 'STATUS_CHANGED' : 'TASK_UPDATED',
        metadata: payload.status
          ? { from: task.status, to: payload.status, source: 'task_update' }
          : { source: 'task_update' },
      },
    });

    return nextUpdate;
  });

  const response: CreateTaskUpdateResponse = serializeTaskUpdate(createdUpdate);
  const { status, body } = successResponse<CreateTaskUpdateResponse>(
    StatusCodes.CREATED,
    'Task update submitted successfully',
    response,
  );
  res.status(status).json(body);
};

export const getTaskUpdates = async (req: Request, res: Response) => {
  const actor = checkAuthenticated(req);
  const actorRole = getActorRole(actor.role);
  const taskId = getRouteParam(req.params.taskId, 'taskId');

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: {
      id: true,
      createdById: true,
      assignedToId: true,
    },
  });

  if (!task) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Task not found');
  }

  if (!canAccessTask(actorRole, actor.userId, task)) {
    throw new AppError(StatusCodes.FORBIDDEN, 'You do not have access to this resource');
  }

  const updates = await prisma.taskUpdate.findMany({
    where: { taskId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  const response: GetTaskUpdatesResponse = {
    updates: updates.map(update => serializeTaskUpdate(update)),
  };

  const { status, body } = successResponse<GetTaskUpdatesResponse>(
    StatusCodes.OK,
    'Task updates fetched successfully',
    response,
  );
  res.status(status).json(body);
};

export const getTaskTimeline = async (req: Request, res: Response) => {
  const actor = checkAuthenticated(req);
  const actorRole = getActorRole(actor.role);
  const taskId = getRouteParam(req.params.taskId, 'taskId');

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: {
      id: true,
      createdById: true,
      assignedToId: true,
    },
  });

  if (!task) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Task not found');
  }

  if (!canAccessTask(actorRole, actor.userId, task)) {
    throw new AppError(StatusCodes.FORBIDDEN, 'You do not have access to this resource');
  }

  const [logs, updates] = await prisma.$transaction([
    prisma.activityLog.findMany({
      where: { taskId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    }),
    prisma.taskUpdate.findMany({
      where: { taskId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    }),
  ]);

  const timelineItems: TaskTimelineEntry[] = [
    ...logs.filter(log => !isTaskUpdateGeneratedLog(log.metadata)).map(log => serializeTimelineLog(log)),
    ...updates.map(update => ({
      type: 'update' as const,
      createdAt: update.createdAt.toISOString(),
      update: serializeTaskUpdate(update),
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const response: GetTaskTimelineResponse = {
    items: timelineItems,
  };

  const { status, body } = successResponse<GetTaskTimelineResponse>(
    StatusCodes.OK,
    'Task timeline fetched successfully',
    response,
  );
  res.status(status).json(body);
};
