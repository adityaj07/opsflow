import { zodResolver } from "@hookform/resolvers/zod";
import { Add01Icon } from "@hugeicons/core-free-icons";
import type { CreateTaskInput, TaskPriority, UserListItem } from "@opsflow/shared";
import { Button } from "@opsflow/ui/components/button";
import { Calendar } from "@opsflow/ui/components/calendar";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@opsflow/ui/components/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@opsflow/ui/components/select";
import { Textarea } from "@opsflow/ui/components/textarea";
import type { WheelPickerOption } from "@/components/wheel-picker/wheel-picker";
import { WheelPicker, WheelPickerWrapper } from "@/components/wheel-picker/wheel-picker";
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
  dueDate?: Date;
  dueHour?: number;
  dueMinute?: number;
  duePeriod?: "AM" | "PM";
};

const priorities: TaskPriority[] = ["HIGH", "MEDIUM", "LOW"];
const hourOptions: WheelPickerOption<number>[] = Array.from({ length: 12 }, (_, index) => ({
  label: String(index + 1).padStart(2, "0"),
  value: index + 1,
}));
const minuteOptions: WheelPickerOption<number>[] = Array.from({ length: 60 }, (_, index) => ({
  label: String(index).padStart(2, "0"),
  value: index,
}));
const periodOptions: WheelPickerOption<"AM" | "PM">[] = [
  { label: "AM", value: "AM" },
  { label: "PM", value: "PM" },
];

const formatDueDateLabel = (date?: Date) => {
  if (!date) return "Pick due date";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(date);
};

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
      dueDate: undefined,
      dueHour: 9,
      dueMinute: 0,
      duePeriod: "AM",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    let dueDateIso: string | undefined;
    if (values.dueDate) {
      const hour12 = values.dueHour ?? 9;
      const minute = values.dueMinute ?? 0;
      const period = values.duePeriod ?? "AM";
      let hour24 = hour12 % 12;
      if (period === "PM") {
        hour24 += 12;
      }
      const dueDate = new Date(values.dueDate);
      dueDate.setHours(hour24, minute, 0, 0);
      dueDateIso = dueDate.toISOString();
    }

    const payload: CreateTaskInput = {
      title: values.title,
      assignedToId: values.assignedToId,
      ...(values.description ? { description: values.description } : {}),
      ...(values.priority ? { priority: values.priority } : {}),
      ...(dueDateIso ? { dueDate: dueDateIso } : {}),
    };

    try {
      await createTaskMutation.mutateAsync(payload);
      toast.success("Task created successfully.");
      form.reset({
        title: "",
        description: "",
        assignedToId: "",
        priority: "MEDIUM",
        dueDate: undefined,
        dueHour: 9,
        dueMinute: 0,
        duePeriod: "AM",
      });
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
                      <SelectValue placeholder="Select assignee">
                        {users.find((member) => member.id === field.value)?.name ?? "Select assignee"}
                      </SelectValue>
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

          <div className="space-y-3">
            <Label>Due Date & Time</Label>
            <Controller
              name="dueDate"
              control={form.control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger render={<Button variant="outline" className="w-full justify-start text-left" />}>
                    {formatDueDateLabel(field.value)}
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
                  </PopoverContent>
                </Popover>
              )}
            />

            <div className="rounded-md border p-2">
              <WheelPickerWrapper className="w-full">
                <Controller
                  name="dueHour"
                  control={form.control}
                  render={({ field }) => (
                    <WheelPicker
                      options={hourOptions}
                      value={field.value ?? 9}
                      onValueChange={(value) => field.onChange(value ?? 9)}
                      infinite
                    />
                  )}
                />
                <Controller
                  name="dueMinute"
                  control={form.control}
                  render={({ field }) => (
                    <WheelPicker
                      options={minuteOptions}
                      value={field.value ?? 0}
                      onValueChange={(value) => field.onChange(value ?? 0)}
                      infinite
                    />
                  )}
                />
                <Controller
                  name="duePeriod"
                  control={form.control}
                  render={({ field }) => (
                    <WheelPicker
                      options={periodOptions}
                      value={field.value ?? "AM"}
                      onValueChange={(value) => field.onChange((value ?? "AM") as "AM" | "PM")}
                    />
                  )}
                />
              </WheelPickerWrapper>
            </div>
            <p className="text-xs text-muted-foreground">
              Optional. Pick a date to apply this time; leave date empty for no due date.
            </p>
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
