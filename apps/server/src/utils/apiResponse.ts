import type { StatusCode } from './statusCodes.js';

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
};

export const successResponse = <T>(status: StatusCode, message: string, data?: T) => ({
  status: status.code,
  body: {
    success: true,
    message,
    data,
  },
});
