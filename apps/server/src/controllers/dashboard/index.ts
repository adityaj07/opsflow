import prisma from '@opsflow/db';
import type {
  DashboardActivityResponse,
  DashboardOverviewResponse,
  UserRole,
} from '@opsflow/shared';
import type { Request, Response } from 'express';
import { checkAuthenticated, getActorRole } from '@/lib/app';
import { successResponse } from '@/utils/apiResponse';
import { StatusCodes } from '@/utils/statusCodes';

const getTaskWhereByRole = (role: 'ADMIN' | 'MANAGER' | 'USER', userId: string) => {
  if (role === 'USER') {
    return { assignedToId: userId };
  }

  if (role === 'MANAGER') {
    return {
      OR: [{ createdById: userId }, { assignedToId: userId }],
    };
  }

  return {};
};

const isTaskUpdateGeneratedLog = (metadata: unknown) => {
  if (!metadata || typeof metadata !== 'object') return false;
  const source = (metadata as Record<string, unknown>).source;
  return source === 'task_update';
};

export const getDashboardOverview = async (req: Request, res: Response) => {
  const actor = checkAuthenticated(req);
  const actorRole = getActorRole(actor.role);
  const whereConditions = getTaskWhereByRole(actorRole, actor.userId);

  const [total, groupedCounts, tasksCreatedByMe, myTasks] = await prisma.$transaction([
    prisma.task.count({ where: whereConditions }),
    prisma.task.groupBy({
      by: ['status'],
      where: whereConditions,
      _count: { status: true },
    }),
    prisma.task.count({ where: { createdById: actor.userId } }),
    prisma.task.count({ where: { assignedToId: actor.userId } }),
  ]);

  let inProgress = 0;
  let done = 0;
  let other = 0;

  for (const item of groupedCounts) {
    const count = item._count.status;
    if (item.status === 'IN_PROGRESS') {
      inProgress += count;
    } else if (item.status === 'DONE') {
      done += count;
    } else {
      other += count;
    }
  }

  const response: DashboardOverviewResponse = {
    role: actor.role as UserRole,
    total,
    inProgress,
    done,
    other,
    tasksCreatedByMe,
    myTasks,
  };

  const { status, body } = successResponse<DashboardOverviewResponse>(
    StatusCodes.OK,
    'Dashboard overview fetched successfully',
    response,
  );
  res.status(status).json(body);
};

export const getDashboardActivity = async (req: Request, res: Response) => {
  const actor = checkAuthenticated(req);
  const actorRole = getActorRole(actor.role);
  const whereConditions = getTaskWhereByRole(actorRole, actor.userId);

  const [logs, updates] = await prisma.$transaction([
    prisma.activityLog.findMany({
      where: {
        task: whereConditions,
      },
      include: {
        user: { select: { id: true, name: true, role: true } },
        task: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 25,
    }),
    prisma.taskUpdate.findMany({
      where: {
        task: whereConditions,
      },
      include: {
        user: { select: { id: true, name: true, role: true } },
        task: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 25,
    }),
  ]);

  const actionLabels: Record<string, string> = {
    TASK_CREATED: 'created task',
    TASK_ASSIGNED: 'reassigned task',
    STATUS_CHANGED: 'changed task status',
    TASK_UPDATED: 'added a task update',
  };

  const filteredLogs = logs.filter(log => !isTaskUpdateGeneratedLog(log.metadata));

  const items = [
    ...filteredLogs.map(log => ({
      id: `log-${log.id}`,
      type: 'log' as const,
      taskId: log.task.id,
      taskTitle: log.task.title,
      actor: {
        id: log.user.id,
        name: log.user.name,
        role: log.user.role as UserRole,
      },
      actionType: log.actionType,
      updateId: null,
      summary: actionLabels[log.actionType] ?? 'updated task',
      whatWasDone: null,
      blockers: null,
      nextSteps: null,
      createdAt: log.createdAt.toISOString(),
    })),
    ...updates.map(update => ({
      id: `update-${update.id}`,
      type: 'update' as const,
      taskId: update.task.id,
      taskTitle: update.task.title,
      actor: {
        id: update.user.id,
        name: update.user.name,
        role: update.user.role as UserRole,
      },
      actionType: null,
      updateId: update.id,
      summary: 'added a task update',
      whatWasDone: update.whatWasDone,
      blockers: update.blockers,
      nextSteps: update.nextSteps,
      createdAt: update.createdAt.toISOString(),
    })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 20);

  const response: DashboardActivityResponse = {
    items,
  };

  const { status, body } = successResponse<DashboardActivityResponse>(
    StatusCodes.OK,
    'Dashboard activity fetched successfully',
    response,
  );
  res.status(status).json(body);
};
