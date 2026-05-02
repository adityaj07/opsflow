import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { dashboardApi } from '@/features/dashboard/api/dashboard.api';

export const useDashboardOverviewQuery = (enabled = true) => {
  return useQuery({
    queryKey: queryKeys.dashboard.overview,
    queryFn: dashboardApi.getOverview,
    enabled,
  });
};

export const useDashboardActivityQuery = (enabled = true) => {
  return useQuery({
    queryKey: queryKeys.dashboard.activity,
    queryFn: dashboardApi.getActivity,
    enabled,
  });
};
