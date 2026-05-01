import { AppError } from '@/utils/apiError';
import { StatusCodes } from '@/utils/statusCodes';
import type { UserRole } from '@opsflow/shared';

export const getRouteParam = (value: string | string[] | undefined, field: string): string => {
  if (typeof value === 'string' && value.length > 0) {
    return value;
  }
  throw new AppError(StatusCodes.BAD_REQUEST, `${field} is required`);
};

export const canAccessTask = (
  role: UserRole,
  userId: string,
  task: { createdById: string; assignedToId: string },
) => {
  if (role === 'ADMIN') {
    return true;
  }

  if (role === 'MANAGER') {
    return task.createdById === userId || task.assignedToId === userId;
  }

  return task.assignedToId === userId;
};
