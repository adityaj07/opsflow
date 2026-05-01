import type { StatusCode } from './statusCodes';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly label: string;
  public readonly isOperational: boolean;

  constructor(status: StatusCode, message: string) {
    super(message);
    this.statusCode = status.code;
    this.label = status.label;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
