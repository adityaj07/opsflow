import type {
  DashboardActivityResponse,
  DashboardOverviewResponse,
  DashboardSummaryResponse,
} from "@opsflow/shared";

import { apiClient } from "@/lib/api/client";
import type { ApiSuccessResponse } from "@/lib/api/types";

export const dashboardApi = {
  getSummary: async () => {
    const response = await apiClient.get<ApiSuccessResponse<DashboardSummaryResponse>>(
      "/dashboard/summary",
    );
    return response.data.data;
  },
  getOverview: async () => {
    const response = await apiClient.get<ApiSuccessResponse<DashboardOverviewResponse>>(
      "/dashboard/overview",
    );
    return response.data.data;
  },
  getActivity: async () => {
    const response = await apiClient.get<ApiSuccessResponse<DashboardActivityResponse>>(
      "/dashboard/activity",
    );
    return response.data.data;
  },
};
