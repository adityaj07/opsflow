import type {
  CreateUserInput,
  CreateUserResponse,
  GetUsersQueryInput,
  GetUsersResponse,
} from "@opsflow/shared";

import { apiClient } from "@/lib/api/client";
import type { ApiSuccessResponse } from "@/lib/api/types";

export const usersApi = {
  getUsers: async (query?: GetUsersQueryInput) => {
    const response = await apiClient.get<ApiSuccessResponse<GetUsersResponse>>("/users", {
      params: query,
    });

    return response.data.data;
  },
  createUser: async (payload: CreateUserInput) => {
    const response = await apiClient.post<ApiSuccessResponse<CreateUserResponse>>("/users", payload);

    return response.data.data;
  },
};
