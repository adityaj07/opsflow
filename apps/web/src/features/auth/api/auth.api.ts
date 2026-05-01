import type { LoginResponse, LogoutResponse, MeResponse, SignInInput } from "@opsflow/shared";

import { apiClient } from "@/lib/api/client";
import type { ApiSuccessResponse } from "@/lib/api/types";

export const authApi = {
  login: async (payload: SignInInput) => {
    const response = await apiClient.post<ApiSuccessResponse<LoginResponse>>("/auth/login", payload);
    return response.data.data;
  },
  me: async () => {
    const response = await apiClient.get<ApiSuccessResponse<MeResponse>>("/auth/me");
    return response.data.data;
  },
  logout: async () => {
    const response = await apiClient.post<ApiSuccessResponse<LogoutResponse>>("/auth/logout");
    return response.data.data;
  },
};
