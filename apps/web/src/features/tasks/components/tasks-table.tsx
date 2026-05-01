import type { Task, UserListItem } from "@opsflow/shared";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useNavigate } from "react-router";
import { Link } from "react-router";

import { toRelativeTime } from "@/features/tasks/lib/time";

const statusClasses: Record<Task["status"], string> = {
  BACKLOG: "bg-zinc-500/10 text-zinc-700 dark:text-zinc-300",
  TODO: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  IN_PROGRESS: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  DONE: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  CANCELED: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  DUPLICATE: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
};

const priorityClasses: Record<Task["priority"], string> = {
  HIGH: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  MEDIUM: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
  LOW: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
};

const columnHelper = createColumnHelper<Task>();

export function TasksTable({
  tasks,
  users,
  currentUserId,
}: {
  tasks: Task[];
  users: UserListItem[];
  currentUserId: string;
}) {
  const navigate = useNavigate();
  const usersById = new Map(users.map((user) => [user.id, user.name]));

  const columns = [
    columnHelper.accessor("title", {
      header: "Title",
      cell: (info) => (
        <Link
          to={`/app/tasks/${info.row.original.id}`}
          className="line-clamp-1 font-medium text-foreground hover:underline"
          onClick={(event) => event.stopPropagation()}
        >
          {info.getValue()}
        </Link>
      ),
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => (
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses[info.getValue()]}`}>
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("assignedToId", {
      header: "Assigned",
      cell: (info) => usersById.get(info.getValue()) ?? "Unknown",
    }),
    columnHelper.accessor("createdById", {
      header: "Assigned By",
      cell: (info) => {
        const createdById = info.getValue();
        const name = usersById.get(createdById) ?? "Unknown";
        if (createdById === currentUserId) {
          return `${name} (You)`;
        }
        return name;
      },
    }),
    columnHelper.accessor("priority", {
      header: "Priority",
      cell: (info) => (
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${priorityClasses[info.getValue()]}`}>
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("lastActivityAt", {
      header: "Last Active",
      cell: (info) => toRelativeTime(info.getValue()),
    }),
  ];

  const table = useReactTable({
    data: tasks,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3 text-left font-medium text-muted-foreground">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="cursor-pointer border-t hover:bg-muted/30"
                onClick={() => navigate(`/app/tasks/${row.original.id}`)}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
