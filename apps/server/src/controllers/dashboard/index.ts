import prisma from '@opsflow/db';
import type { DashboardSummaryResponse } from '@opsflow/shared';
import type { Request, Response } from 'express';
import { checkAuthenticated, getActorRole } from '@/lib/app';
import { successResponse } from '@/utils/apiResponse';
import { StatusCodes } from '@/utils/statusCodes';

export const getDashboardSummary = async (req: Request, res: Response) => {
  const actor = checkAuthenticated(req);
  const actorRole = getActorRole(actor.role);

  const whereConditions: Record<string, unknown> = {};
  if (actorRole === 'USER') {
    whereConditions.assignedToId = actor.userId;
  } else if (actorRole === 'MANAGER') {
    whereConditions.OR = [{ createdById: actor.userId }, { assignedToId: actor.userId }];
  }

  const [total, groupedCounts] = await prisma.$transaction([
    prisma.task.count({
      where: whereConditions,
    }),
    prisma.task.groupBy({
      by: ['status'],
      where: whereConditions,
      _count: {
        status: true,
      },
    }),
  ]);

  let todo = 0;
  let inProgress = 0;
  let done = 0;
  let other = 0;

  for (const item of groupedCounts) {
    const count = item._count.status;
    if (item.status === 'TODO') {
      todo += count;
    } else if (item.status === 'IN_PROGRESS') {
      inProgress += count;
    } else if (item.status === 'DONE') {
      done += count;
    } else {
      other += count;
    }
  }

  const response: DashboardSummaryResponse = {
    total,
    todo,
    inProgress,
    done,
    other,
  };

  const { status, body } = successResponse<DashboardSummaryResponse>(
    StatusCodes.OK,
    'Dashboard summary fetched successfully',
    response,
  );
  res.status(status).json(body);
};
