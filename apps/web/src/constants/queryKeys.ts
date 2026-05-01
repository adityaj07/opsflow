import type { GetUsersQueryInput } from "@opsflow/shared";

export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  users: {
    all: ["users"] as const,
    list: (query?: GetUsersQueryInput) => ["users", "list", query ?? {}] as const,
  },
} as const;
