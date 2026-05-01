import { useQuery } from "@tanstack/react-query";

import { authApi } from "@/features/auth/api/auth.api";
import { queryKeys } from "@/constants/queryKeys";

export const useMeQuery = () => {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: authApi.me,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
};
