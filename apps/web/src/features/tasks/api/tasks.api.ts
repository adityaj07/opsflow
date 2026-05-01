import type {
  AssignTaskInput,
  AssignTaskResponse,
  ChangeTaskStatusInput,
  ChangeTaskStatusResponse,
  CreateTaskInput,
  CreateTaskResponse,
  CreateTaskUpdateInput,
  CreateTaskUpdateResponse,
  GetTaskByIdResponse,
  GetTaskTimelineResponse,
  GetTasksQueryInput,
  GetTasksResponse,
  UpdateTaskInput,
  UpdateTaskResponse,
} from "@opsflow/shared";

import { apiClient } from "@/lib/api/client";
import type { ApiSuccessResponse } from "@/lib/api/types";

export const tasksApi = {
  getTasks: async (query: GetTasksQueryInput) => {
    const response = await apiClient.get<ApiSuccessResponse<GetTasksResponse>>("/tasks", {
      params: query,
    });

    return response.data.data;
  },
  createTask: async (payload: CreateTaskInput) => {
    const response = await apiClient.post<ApiSuccessResponse<CreateTaskResponse>>("/tasks", payload);

    return response.data.data;
  },
  getTaskById: async (taskId: string) => {
    const response = await apiClient.get<ApiSuccessResponse<GetTaskByIdResponse>>(`/tasks/${taskId}`);
    return response.data.data;
  },
  getTaskTimeline: async (taskId: string) => {
    const response = await apiClient.get<ApiSuccessResponse<GetTaskTimelineResponse>>(
      `/tasks/${taskId}/timeline`,
    );
    return response.data.data;
  },
  changeTaskStatus: async (taskId: string, payload: ChangeTaskStatusInput) => {
    const response = await apiClient.patch<ApiSuccessResponse<ChangeTaskStatusResponse>>(
      `/tasks/${taskId}/status`,
      payload,
    );
    return response.data.data;
  },
  assignTask: async (taskId: string, payload: AssignTaskInput) => {
    const response = await apiClient.patch<ApiSuccessResponse<AssignTaskResponse>>(
      `/tasks/${taskId}/assign`,
      payload,
    );
    return response.data.data;
  },
  updateTask: async (taskId: string, payload: UpdateTaskInput) => {
    const response = await apiClient.patch<ApiSuccessResponse<UpdateTaskResponse>>(
      `/tasks/${taskId}`,
      payload,
    );
    return response.data.data;
  },
  createTaskUpdate: async (taskId: string, payload: CreateTaskUpdateInput) => {
    const response = await apiClient.post<ApiSuccessResponse<CreateTaskUpdateResponse>>(
      `/tasks/${taskId}/updates`,
      payload,
    );
    return response.data.data;
  },
};
