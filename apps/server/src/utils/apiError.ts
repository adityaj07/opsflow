import type { StatusCode } from './statusCodes.js';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly label: string;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(status: StatusCode, message: string, details?: unknown) {
    super(message);
    this.statusCode = status.code;
    this.label = status.label;
    this.isOperational = true;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}
