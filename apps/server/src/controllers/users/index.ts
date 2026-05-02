import prisma from '@opsflow/db';
import { createUserSchema, getUsersQuerySchema } from '@opsflow/shared';
import type { AuthUser, CreateUserResponse, GetUsersResponse, UserListItem, UserRole } from '@opsflow/shared';
import type { Request, Response } from 'express';
import { hashPassword } from '../../lib/auth/password.js';
import { AppError } from '../../utils/apiError.js';
import { successResponse } from '../../utils/apiResponse.js';
import { StatusCodes } from '../../utils/statusCodes.js';

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

export const getUsers = async (req: Request, res: Response) => {
  const parsedQuery = getUsersQuerySchema.safeParse(req.query);
  if (!parsedQuery.success) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Validation failed', parsedQuery.error.issues);
  }

  const where = parsedQuery.data.role ? { role: parsedQuery.data.role } : undefined;
  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const response: GetUsersResponse = {
    users: users.map<UserListItem>(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as UserRole,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
    })),
  };

  const { status, body } = successResponse<GetUsersResponse>(
    StatusCodes.OK,
    'Users fetched successfully',
    response,
  );
  res.status(status).json(body);
};
