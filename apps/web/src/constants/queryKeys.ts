import type { GetTasksQueryInput, GetUsersQueryInput } from "@opsflow/shared";

export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  dashboard: {
    summary: ["dashboard", "summary"] as const,
    overview: ["dashboard", "overview"] as const,
    activity: ["dashboard", "activity"] as const,
  },
  users: {
    all: ["users"] as const,
    list: (query?: GetUsersQueryInput) => ["users", "list", query ?? {}] as const,
  },
  tasks: {
    all: ["tasks"] as const,
    list: (query: GetTasksQueryInput) => ["tasks", "list", query] as const,
    detail: (taskId: string) => ["tasks", "detail", taskId] as const,
    timeline: (taskId: string) => ["tasks", "timeline", taskId] as const,
  },
} as const;
