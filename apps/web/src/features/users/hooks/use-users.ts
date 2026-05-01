import type { CreateUserInput, GetUsersQueryInput } from "@opsflow/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/constants/queryKeys";
import { usersApi } from "@/features/users/api/users.api";

export const useUsersQuery = (query?: GetUsersQueryInput) => {
  return useQuery({
    queryKey: queryKeys.users.list(query),
    queryFn: () => usersApi.getUsers(query),
  });
};

export const useCreateUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserInput) => usersApi.createUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
};
