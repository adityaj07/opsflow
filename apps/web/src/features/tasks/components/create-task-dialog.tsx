import { zodResolver } from "@hookform/resolvers/zod";
import { Add01Icon } from "@hugeicons/core-free-icons";
import type { CreateTaskInput, TaskPriority, UserListItem } from "@opsflow/shared";
import { Button } from "@opsflow/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@opsflow/ui/components/dialog";
import { Input } from "@opsflow/ui/components/input";
import { Label } from "@opsflow/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@opsflow/ui/components/select";
import { Textarea } from "@opsflow/ui/components/textarea";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Icon } from "@/components/icon";
import { useCreateTaskMutation } from "@/features/tasks/hooks/use-tasks";
import { createTaskFormSchema } from "@/features/tasks/schemas/create-task-form.schema";
import { getApiErrorMessage } from "@/lib/utils/http";

type CreateTaskFormValues = {
  title: string;
  description?: string;
  assignedToId: string;
  priority?: TaskPriority;
  dueDate?: string;
};

const priorities: TaskPriority[] = ["HIGH", "MEDIUM", "LOW"];

export function CreateTaskDialog({ users }: { users: UserListItem[] }) {
  const [open, setOpen] = useState(false);
  const createTaskMutation = useCreateTaskMutation();

  const form = useForm<CreateTaskFormValues>({
    resolver: zodResolver(createTaskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      assignedToId: "",
      priority: "MEDIUM",
      dueDate: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const payload: CreateTaskInput = {
      title: values.title,
      assignedToId: values.assignedToId,
      ...(values.description ? { description: values.description } : {}),
      ...(values.priority ? { priority: values.priority } : {}),
      ...(values.dueDate ? { dueDate: new Date(values.dueDate).toISOString() } : {}),
    };

    try {
      await createTaskMutation.mutateAsync(payload);
      toast.success("Task created successfully.");
      form.reset({ title: "", description: "", assignedToId: "", priority: "MEDIUM", dueDate: "" });
      setOpen(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Icon icon={Add01Icon} className="size-4" />
        Create Task
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
          <DialogDescription>Assign a task and start tracking execution.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" noValidate onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="task-title">Title</Label>
            <Input id="task-title" {...form.register("title")} />
            {form.formState.errors.title ? <p className="text-sm text-destructive">{form.formState.errors.title.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-description">Description</Label>
            <Textarea id="task-description" rows={4} {...form.register("description")} />
            {form.formState.errors.description ? <p className="text-sm text-destructive">{form.formState.errors.description.message}</p> : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="task-assigned">Assigned</Label>
              <Controller
                name="assignedToId"
                control={form.control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="task-assigned" className="w-full">
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {users.length === 0 ? (
                <p className="text-sm text-muted-foreground">No assignable users available right now.</p>
              ) : null}
              {form.formState.errors.assignedToId ? <p className="text-sm text-destructive">{form.formState.errors.assignedToId.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-priority">Priority</Label>
              <Controller
                name="priority"
                control={form.control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="task-priority" className="w-full">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {priority}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-due-date">Due Date</Label>
            <Input id="task-due-date" type="datetime-local" {...form.register("dueDate")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createTaskMutation.isPending || users.length === 0}>
              {createTaskMutation.isPending ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
