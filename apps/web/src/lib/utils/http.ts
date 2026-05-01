import { AxiosError } from "axios";

import type { ApiErrorResponse } from "@/lib/api/types";

const FALLBACK_ERROR_MESSAGE = "Something went wrong. Please try again.";

export const getApiErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const message = (error.response?.data as ApiErrorResponse | undefined)?.message;
    if (message) {
      return message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return FALLBACK_ERROR_MESSAGE;
};
