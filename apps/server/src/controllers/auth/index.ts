import prisma from '@opsflow/db';
import { env } from '@opsflow/env/server';
import { signInSchema, signUpSchema } from '@opsflow/shared';
import type {
  AuthUser,
  LoginResponse,
  LogoutResponse,
  MeResponse,
  SignupResponse,
  UserRole,
} from '@opsflow/shared';
import type { Request, Response } from 'express';
import { hashPassword, comparePassword } from '../../lib/auth/password.js';
import { signToken } from '../../lib/auth/jwt.js';
import { AppError } from '../../utils/apiError.js';
import { successResponse } from '../../utils/apiResponse.js';
import { StatusCodes } from '../../utils/statusCodes.js';
import { setAuthCookie } from '../../lib/auth/cookie.js';
import { AUTH_COOKIE_NAME } from '../../constants/auth.js';

const toAuthUser = (user: {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}): AuthUser => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

export const signup = async (req: Request, res: Response) => {
  const parsedPayload = signUpSchema.safeParse(req.body);

  if (!parsedPayload.success) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Validation failed', parsedPayload.error.issues);
  }
  const payload = parsedPayload.data;
  const email = payload.email;

  // search existing user
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    throw new AppError(StatusCodes.CONFLICT, 'User already exists with this email');
  }

  // hash password
  const passwordHash = await hashPassword(payload.password);
  const createdUser = await prisma.user.create({
    data: {
      name: payload.name,
      email,
      password: passwordHash,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  // sign token
  const accessToken = signToken({
    userId: createdUser.id,
    role: createdUser.role,
  });

  // set token in cookie
  setAuthCookie(res, accessToken);

  // structure up the schema
  const response: SignupResponse = {
    user: toAuthUser(createdUser),
    accessToken,
  };

  const { status, body } = successResponse<SignupResponse>(
    StatusCodes.CREATED,
    'Signup successful',
    response,
  );
  res.status(status).json(body);
};

export const login = async (req: Request, res: Response) => {
  const parsedPayload = signInSchema.safeParse(req.body);

  if (!parsedPayload.success) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Validation failed', parsedPayload.error.issues);
  }
  const payload = parsedPayload.data;
  const email = payload.email;

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      password: true,
      isActive: true,
    },
  });

  if (!user || !user.isActive) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid email or password');
  }

  // check password
  const isPasswordValid = await comparePassword(payload.password, user.password);
  if (!isPasswordValid) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid email or password');
  }

  // sign token
  const accessToken = signToken({
    userId: user.id,
    role: user.role,
  });

  // set it into cookie
  setAuthCookie(res, accessToken);

  // structure the response
  const response: LoginResponse = {
    user: toAuthUser(user),
    accessToken,
  };

  const { status, body } = successResponse<LoginResponse>(
    StatusCodes.OK,
    'Login successful',
    response,
  );
  res.status(status).json(body);
};

export const me = async (req: Request, res: Response) => {
  const authUser = req.user;
  if (!authUser) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { id: authUser.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  if (!user || !user.isActive) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Unauthorized');
  }

  const response: MeResponse = {
    user: toAuthUser(user),
  };

  const { status, body } = successResponse<MeResponse>(
    StatusCodes.OK,
    'Current user fetched',
    response,
  );
  res.status(status).json(body);
};

export const logout = async (_req: Request, res: Response) => {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
  });

  const response: LogoutResponse = {
    loggedOut: true,
  };

  const { status, body } = successResponse<LogoutResponse>(
    StatusCodes.OK,
    'Logout successful',
    response,
  );
  res.status(status).json(body);
};
