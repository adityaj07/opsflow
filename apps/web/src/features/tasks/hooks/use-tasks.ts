import type {
  AssignTaskInput,
  ChangeTaskStatusInput,
  CreateTaskInput,
  CreateTaskUpdateInput,
  GetTasksQueryInput,
  UpdateTaskInput,
} from "@opsflow/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/constants/queryKeys";
import { tasksApi } from "@/features/tasks/api/tasks.api";

export const useTasksQuery = (query: GetTasksQueryInput) => {
  return useQuery({
    queryKey: queryKeys.tasks.list(query),
    queryFn: () => tasksApi.getTasks(query),
  });
};

export const useCreateTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTaskInput) => tasksApi.createTask(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
  });
};

export const useTaskDetailQuery = (taskId: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.tasks.detail(taskId),
    queryFn: () => tasksApi.getTaskById(taskId),
    enabled: enabled && Boolean(taskId),
  });
};

export const useTaskTimelineQuery = (taskId: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.tasks.timeline(taskId),
    queryFn: () => tasksApi.getTaskTimeline(taskId),
    enabled: enabled && Boolean(taskId),
  });
};

const invalidateTaskViews = async (queryClient: ReturnType<typeof useQueryClient>, taskId: string) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(taskId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.tasks.timeline(taskId) }),
  ]);
};

export const useChangeTaskStatusMutation = (taskId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ChangeTaskStatusInput) => tasksApi.changeTaskStatus(taskId, payload),
    onSuccess: async () => {
      await invalidateTaskViews(queryClient, taskId);
    },
  });
};

export const useAssignTaskMutation = (taskId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AssignTaskInput) => tasksApi.assignTask(taskId, payload),
    onSuccess: async () => {
      await invalidateTaskViews(queryClient, taskId);
    },
  });
};

export const useUpdateTaskMutation = (taskId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateTaskInput) => tasksApi.updateTask(taskId, payload),
    onSuccess: async () => {
      await invalidateTaskViews(queryClient, taskId);
    },
  });
};

export const useCreateTaskUpdateMutation = (taskId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTaskUpdateInput) => tasksApi.createTaskUpdate(taskId, payload),
    onSuccess: async () => {
      await invalidateTaskViews(queryClient, taskId);
    },
  });
};
