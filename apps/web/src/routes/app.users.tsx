import { useEffect } from "react";
import { Navigate } from "react-router";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";

import { InviteUserDialog } from "@/features/users/components/invite-user-dialog";
import { UsersList } from "@/features/users/components/users-list";
import { UsersListSkeleton } from "@/features/users/components/users-list-skeleton";
import { useUsersQuery } from "@/features/users/hooks/use-users";
import { getApiErrorMessage } from "@/lib/utils/http";
import { useAppStore } from "@/store";

export default function UsersRoute() {
  const { user } = useAppStore(useShallow((state) => ({ user: state.user })));
  const usersQuery = useUsersQuery();

  useEffect(() => {
    if (usersQuery.isError) {
      toast.error(getApiErrorMessage(usersQuery.error));
    }
  }, [usersQuery.isError, usersQuery.error]);

  if (user?.role !== "ADMIN") {
    return <Navigate to="/app/dashboard" replace />;
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          <p className="text-muted-foreground">Manage your agency team members and role access.</p>
        </div>
        <InviteUserDialog />
      </header>

      {usersQuery.isLoading ? <UsersListSkeleton /> : null}
      {usersQuery.isSuccess ? <UsersList users={usersQuery.data.users} /> : null}
    </section>
  );
}
