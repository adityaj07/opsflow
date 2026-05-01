import prisma from '@opsflow/db';
import { createUserSchema } from '@opsflow/shared';
import type { AuthUser, CreateUserResponse, UserRole } from '@opsflow/shared';
import type { Request, Response } from 'express';
import { hashPassword } from '@/lib/auth/password';
import { AppError } from '@/utils/apiError';
import { successResponse } from '@/utils/apiResponse';
import { StatusCodes } from '@/utils/statusCodes';

const toAuthUser = (user: { id: string; name: string; email: string; role: UserRole }): AuthUser => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

export const createUser = async (req: Request, res: Response) => {
  const parsedPayload = createUserSchema.safeParse(req.body);
  if (!parsedPayload.success) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Validation failed', parsedPayload.error.issues);
  }

  const payload = parsedPayload.data;
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
    select: { id: true },
  });

  if (existingUser) {
    throw new AppError(StatusCodes.CONFLICT, 'User already exists with this email');
  }

  const passwordHash = await hashPassword(payload.password);
  const createdUser = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: passwordHash,
      role: payload.role,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  const response: CreateUserResponse = {
    user: toAuthUser(createdUser),
  };

  const { status, body } = successResponse<CreateUserResponse>(
    StatusCodes.CREATED,
    'User created successfully',
    response,
  );
  res.status(status).json(body);
};
