import type { GetTasksQueryInput, TaskPriority, TaskStatus } from "@opsflow/shared";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Outlet, useLocation } from "react-router";
import { useShallow } from "zustand/react/shallow";

import { CreateTaskDialog } from "@/features/tasks/components/create-task-dialog";
import { TasksFilters } from "@/features/tasks/components/tasks-filters";
import { TasksTable } from "@/features/tasks/components/tasks-table";
import { TasksTableSkeleton } from "@/features/tasks/components/tasks-table-skeleton";
import { useTasksQuery } from "@/features/tasks/hooks/use-tasks";
import { useUsersQuery } from "@/features/users/hooks/use-users";
import { getApiErrorMessage } from "@/lib/utils/http";
import { useAppStore } from "@/store";

type LocalFilters = {
  status: TaskStatus | "ALL";
  priority: TaskPriority | "ALL";
  assignedToId: string | "ALL";
};

export default function TasksRoute() {
  const location = useLocation();
  const isTaskDetailRoute = location.pathname.startsWith("/app/tasks/");

  if (isTaskDetailRoute) {
    return <Outlet />;
  }

  const { user } = useAppStore(useShallow((state) => ({ user: state.user })));
  const [filters, setFilters] = useState<LocalFilters>({
    status: "ALL",
    priority: "ALL",
    assignedToId: "ALL",
  });

  const usersQuery = useUsersQuery(
    undefined,
    user?.role === "ADMIN" || user?.role === "MANAGER",
  );

  const taskQueryInput = useMemo<GetTasksQueryInput>(
    () => ({
      page: 1,
      limit: 50,
      ...(filters.status !== "ALL" ? { status: filters.status } : {}),
      ...(filters.priority !== "ALL" ? { priority: filters.priority } : {}),
      ...(filters.assignedToId !== "ALL" ? { assignedToId: filters.assignedToId } : {}),
    }),
    [filters],
  );

  const tasksQuery = useTasksQuery(taskQueryInput);

  useEffect(() => {
    if (tasksQuery.isError) {
      toast.error(getApiErrorMessage(tasksQuery.error));
    }
  }, [tasksQuery.error, tasksQuery.isError]);

  useEffect(() => {
    if (usersQuery.isError && (user?.role === "ADMIN" || user?.role === "MANAGER")) {
      toast.error(getApiErrorMessage(usersQuery.error));
    }
  }, [user?.role, usersQuery.error, usersQuery.isError]);

  const canCreateTask = user?.role === "ADMIN" || user?.role === "MANAGER";

  const users = usersQuery.data?.users ?? [];

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
        </div>
        {canCreateTask ? <CreateTaskDialog users={users} /> : null}
      </header>

      <TasksFilters users={users} filters={filters} onChange={setFilters} />

      {tasksQuery.isLoading ? <TasksTableSkeleton /> : null}

      {tasksQuery.isSuccess && tasksQuery.data.data.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <p className="mb-4 text-muted-foreground">No tasks yet</p>
          {canCreateTask ? <CreateTaskDialog users={users} /> : null}
        </div>
      ) : null}

      {tasksQuery.isSuccess && tasksQuery.data.data.length > 0 ? (
        <TasksTable tasks={tasksQuery.data.data} users={users} currentUserId={user?.id ?? ""} />
      ) : null}
    </section>
  );
}
