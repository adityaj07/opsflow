import type { TaskPriority, TaskStatus, UserListItem } from "@opsflow/shared";
import { Label } from "@opsflow/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@opsflow/ui/components/select";

type Props = {
  users: UserListItem[];
  filters: {
    status: TaskStatus | "ALL";
    priority: TaskPriority | "ALL";
    assignedToId: string | "ALL";
  };
  onChange: (next: Props["filters"]) => void;
};

const statuses: Array<TaskStatus | "ALL"> = ["ALL", "TODO", "IN_PROGRESS", "DONE", "BACKLOG", "CANCELED", "DUPLICATE"];
const priorities: Array<TaskPriority | "ALL"> = ["ALL", "HIGH", "MEDIUM", "LOW"];

export function TasksFilters({ users, filters, onChange }: Props) {
  return (
    <section className="grid gap-3 rounded-lg border bg-card/50 p-3 md:grid-cols-3">
      <div className="space-y-1.5">
        <Label>Status</Label>
        <Select
          value={filters.status}
          onValueChange={(value) => {
            if (!value) return;
            onChange({ ...filters, status: value as Props["filters"]["status"] });
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Priority</Label>
        <Select
          value={filters.priority}
          onValueChange={(value) => {
            if (!value) return;
            onChange({ ...filters, priority: value as Props["filters"]["priority"] });
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            {priorities.map((priority) => (
              <SelectItem key={priority} value={priority}>
                {priority}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Assigned</Label>
        <Select
          value={filters.assignedToId}
          onValueChange={(value) => {
            if (!value) return;
            onChange({ ...filters, assignedToId: value });
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Assigned user" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">ALL</SelectItem>
            {users.map((member) => (
              <SelectItem key={member.id} value={member.id}>
                {member.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </section>
  );
}
