import type { UserListItem } from "@opsflow/shared";

const roleClasses: Record<UserListItem["role"], string> = {
  ADMIN: "bg-red-500/10 text-red-700 dark:text-red-300",
  MANAGER: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  USER: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
};

export function UsersList({ users }: { users: UserListItem[] }) {
  if (users.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">No users found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {users.map((user) => (
        <article key={user.id} className="rounded-lg border bg-card/60 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="truncate font-medium">{user.name}</p>
              <p className="truncate text-sm text-muted-foreground">{user.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${roleClasses[user.role]}`}>
                {user.role}
              </span>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  user.isActive
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : "bg-zinc-500/10 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                {user.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
