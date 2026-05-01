import type { SignInInput } from "@opsflow/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/constants/queryKeys";
import { authApi } from "@/features/auth/api/auth.api";
import { useAppStore } from "@/store";

export const useLoginMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SignInInput) => authApi.login(payload),
    onSuccess: (result) => {
      useAppStore.getState().setUser(result.user);
      queryClient.setQueryData(queryKeys.auth.me, { user: result.user });
    },
  });
};

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      useAppStore.getState().clearAuth();
      queryClient.removeQueries({ queryKey: queryKeys.auth.me });
    },
  });
};
