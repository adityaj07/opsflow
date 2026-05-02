import type { Task, TaskStatus } from '@opsflow/shared';
import { Button } from '@opsflow/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@opsflow/ui/components/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@opsflow/ui/components/dialog';
import { Label } from '@opsflow/ui/components/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@opsflow/ui/components/select';
import { Skeleton } from '@opsflow/ui/components/skeleton';
import { Textarea } from '@opsflow/ui/components/textarea';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';

import {
  useAssignTaskMutation,
  useChangeTaskStatusMutation,
  useCreateTaskUpdateMutation,
  useTaskDetailQuery,
  useTaskTimelineQuery,
} from '@/features/tasks/hooks/use-tasks';
import { toRelativeTime } from '@/features/tasks/lib/time';
import { useUsersQuery } from '@/features/users/hooks/use-users';
import { getApiErrorMessage } from '@/lib/utils/http';
import { useAppStore } from '@/store';

const statuses: TaskStatus[] = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'DONE', 'CANCELED', 'DUPLICATE'];

const statusClasses: Record<Task['status'], string> = {
  BACKLOG: 'bg-zinc-500/10 text-zinc-700 dark:text-zinc-300',
  TODO: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  IN_PROGRESS: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
  DONE: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  CANCELED: 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
  DUPLICATE: 'bg-violet-500/10 text-violet-700 dark:text-violet-300',
};

const priorityClasses: Record<Task['priority'], string> = {
  HIGH: 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
  MEDIUM: 'bg-orange-500/10 text-orange-700 dark:text-orange-300',
  LOW: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
};

const timelineEventLabel: Record<string, string> = {
  TASK_CREATED: 'Task created',
  TASK_ASSIGNED: 'Task reassigned',
  STATUS_CHANGED: 'Status changed',
  TASK_UPDATED: 'Task updated',
};

const formatDate = (iso: string | null) => {
  if (!iso) return 'Not set';
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso));
};

const formatDateLabel = (iso: string | null) => {
  if (!iso) return 'Unknown';
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(d);
};

const formatTimeOnly = (iso: string | null) => {
  if (!iso) return '';
  return new Intl.DateTimeFormat('en-IN', { timeStyle: 'short' }).format(new Date(iso));
};

export default function TaskDetailRoute() {
  const { taskId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAppStore(state => state.user);
  const canManageTask = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const isTaskIdValid = Boolean(taskId);
  const detailQuery = useTaskDetailQuery(taskId ?? '', isTaskIdValid);
  const timelineQuery = useTaskTimelineQuery(taskId ?? '', isTaskIdValid);
  const usersQuery = useUsersQuery(undefined, canManageTask);

  const changeStatusMutation = useChangeTaskStatusMutation(taskId ?? '');
  const assignTaskMutation = useAssignTaskMutation(taskId ?? '');
  const createTaskUpdateMutation = useCreateTaskUpdateMutation(taskId ?? '');

  const [taskStatus, setTaskStatus] = useState<TaskStatus | ''>('');
  const [assignedToId, setAssignedToId] = useState('');

  const [whatWasDone, setWhatWasDone] = useState('');
  const [blockers, setBlockers] = useState('');
  const [nextSteps, setNextSteps] = useState('');
  const [updateStatus, setUpdateStatus] = useState<TaskStatus | 'NONE'>('NONE');
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);

  const task = detailQuery.data;
  const timelineItems = timelineQuery.data?.items ?? [];
  const highlightedUpdateId = useMemo(() => {
    const search = new URLSearchParams(location.search);
    const value = search.get('updateId');
    return value ?? null;
  }, [location.search]);

  const canSubmitTaskUpdate = useMemo(() => {
    return whatWasDone.trim().length > 0 && !createTaskUpdateMutation.isPending;
  }, [createTaskUpdateMutation.isPending, whatWasDone]);
  const users = usersQuery.data?.users ?? [];
  const selectedAssigneeName =
    users.find(member => member.id === assignedToId)?.name ??
    task?.assignedTo.name ??
    'Select assignee';

  useEffect(() => {
    if (!task) return;
    setTaskStatus(task.status);
    setAssignedToId(task.assignedToId);
  }, [task]);

  useEffect(() => {
    if (!highlightedUpdateId || !timelineQuery.isSuccess) return;
    const targetId = `task-update-${highlightedUpdateId}`;
    const timeout = setTimeout(() => {
      const element = document.getElementById(targetId);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 80);

    return () => clearTimeout(timeout);
  }, [highlightedUpdateId, timelineQuery.isSuccess]);

  if (!isTaskIdValid) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">Invalid task id.</p>
        <Button className="mt-4" onClick={() => navigate('/app/tasks')}>
          Back to tasks
        </Button>
      </div>
    );
  }

  if (detailQuery.isLoading) {
    return (
      <section className="space-y-6">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-72 w-full" />
      </section>
    );
  }

  if (detailQuery.isError || !task) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">
          {detailQuery.isError ? getApiErrorMessage(detailQuery.error) : 'Task not found.'}
        </p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <Button variant="outline" onClick={() => detailQuery.refetch()}>
            Retry
          </Button>
          <Button onClick={() => navigate('/app/tasks')}>Back to tasks</Button>
        </div>
      </div>
    );
  }

  const handleStatusChange = async () => {
    if (!taskStatus || taskStatus === task.status) return;
    try {
      await changeStatusMutation.mutateAsync({ status: taskStatus });
      toast.success('Task status updated.');
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const handleAssigneeChange = async () => {
    if (!assignedToId || assignedToId === task.assignedToId) return;
    try {
      await assignTaskMutation.mutateAsync({ assignedToId });
      toast.success('Task reassigned successfully.');
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const handleCreateUpdate = async () => {
    if (!whatWasDone.trim()) {
      toast.error('What did you do is required.');
      return;
    }

    try {
      await createTaskUpdateMutation.mutateAsync({
        whatWasDone: whatWasDone.trim(),
        ...(blockers.trim() ? { blockers: blockers.trim() } : {}),
        ...(nextSteps.trim() ? { nextSteps: nextSteps.trim() } : {}),
        ...(updateStatus !== 'NONE' ? { status: updateStatus } : {}),
      });
      setWhatWasDone('');
      setBlockers('');
      setNextSteps('');
      setUpdateStatus('NONE');
      setIsUpdateDialogOpen(false);
      toast.success('Update submitted.');
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <section className="space-y-6">
      <Card className="overflow-hidden border-border/80">
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500" />
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{task.title}</h1>
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses[task.status]}`}
              >
                {task.status}
              </span>
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${priorityClasses[task.priority]}`}
              >
                {task.priority}
              </span>
            </div>
            <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
              <p>
                Assigned:{' '}
                <span className="font-medium text-foreground">{task.assignedTo.name}</span>
              </p>
              <p>
                Due: <span className="font-medium text-foreground">{formatDate(task.dueDate)}</span>
              </p>
              <p>
                Created by:{' '}
                <span className="font-medium text-foreground">{task.createdBy.name}</span>
              </p>
              <p>
                Last activity:{' '}
                <span className="font-medium text-foreground">
                  {toRelativeTime(task.lastActivityAt)}
                </span>
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 border-t bg-muted/20 py-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="task-status">Change Status</Label>
            <div className="flex gap-2">
              <Select
                value={taskStatus}
                onValueChange={value => setTaskStatus(value as TaskStatus)}
              >
                <SelectTrigger id="task-status" className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={handleStatusChange}
                disabled={
                  changeStatusMutation.isPending || !taskStatus || taskStatus === task.status
                }
              >
                {changeStatusMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
          {canManageTask ? (
            <div className="space-y-2">
              <Label htmlFor="task-assigned">Reassign</Label>
              <div className="flex gap-2">
                <Select value={assignedToId} onValueChange={value => setAssignedToId(value ?? '')}>
                  <SelectTrigger id="task-assigned" className="w-full">
                    <SelectValue>{selectedAssigneeName}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(member => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={handleAssigneeChange}
                  disabled={
                    !canManageTask ||
                    assignTaskMutation.isPending ||
                    !assignedToId ||
                    assignedToId === task.assignedToId ||
                    usersQuery.isLoading
                  }
                >
                  {assignTaskMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
              </div>
              {/* {!canManageTask ? (
              <p className="text-xs text-muted-foreground">Only admins/managers can reassign.</p>
            ) : null} */}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Task Updates</CardTitle>
          <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
            <DialogTrigger render={<Button size="sm" />}>Submit Update</DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit Task Update</DialogTitle>
                <DialogDescription>Share progress, blockers, and next steps.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="what-was-done">What did you do? *</Label>
                  <Textarea
                    id="what-was-done"
                    rows={4}
                    value={whatWasDone}
                    onChange={event => setWhatWasDone(event.target.value)}
                    placeholder="Describe completed work..."
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="blockers">Blockers</Label>
                    <Textarea
                      id="blockers"
                      rows={3}
                      value={blockers}
                      onChange={event => setBlockers(event.target.value)}
                      placeholder="Any blockers?"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="next-steps">Next steps</Label>
                    <Textarea
                      id="next-steps"
                      rows={3}
                      value={nextSteps}
                      onChange={event => setNextSteps(event.target.value)}
                      placeholder="What happens next?"
                    />
                  </div>
                </div>
                <div className="w-full sm:max-w-xs">
                  <Label htmlFor="update-status" className="mb-2 block">
                    Status (optional)
                  </Label>
                  <Select
                    value={updateStatus}
                    onValueChange={value => setUpdateStatus(value as TaskStatus | 'NONE')}
                  >
                    <SelectTrigger id="update-status" className="w-full">
                      <SelectValue placeholder="Keep current status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">Keep current status</SelectItem>
                      {statuses.map(status => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsUpdateDialogOpen(false)}
                  disabled={createTaskUpdateMutation.isPending}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateUpdate} disabled={!canSubmitTaskUpdate}>
                  {createTaskUpdateMutation.isPending ? 'Submitting...' : 'Submit Update'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Keep updates concise and structured. Use the{' '}
            <span className="font-medium text-foreground">Submit Update</span> button to log
            progress.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {timelineQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : null}
          {timelineQuery.isError ? (
            <div className="rounded-md border border-dashed p-4">
              <p className="text-sm text-muted-foreground">
                {getApiErrorMessage(timelineQuery.error)}
              </p>
            </div>
          ) : null}
          {timelineQuery.isSuccess && timelineItems.length === 0 ? (
            <div className="rounded-md border border-dashed p-4">
              <p className="text-sm text-muted-foreground">No activity yet.</p>
            </div>
          ) : null}
          {timelineQuery.isSuccess && timelineItems.length > 0 ? (
            <div className="space-y-6">
              {(() => {
                const groups: Record<string, typeof timelineItems> = {};
                const order: string[] = [];
                timelineItems.forEach(item => {
                  const label = formatDateLabel(item.createdAt);
                  if (!groups[label]) {
                    groups[label] = [];
                    order.push(label);
                  }
                  groups[label].push(item);
                });

                return order.map(label => (
                  <div key={label} className="py-3">
                    <div className="mb-3 flex items-center gap-3">
                      <h3 className="text-sm font-semibold">{label}</h3>
                      <div className="flex-1 border-t border-muted" />
                    </div>
                    <div className="space-y-4">
                      {groups[label].map((item, idx) => (
                        <article
                          key={`${item.createdAt}-${idx}`}
                          id={item.type === 'update' ? `task-update-${item.update.id}` : undefined}
                          className="relative pl-8"
                        >
                          {idx < groups[label].length - 1 ? (
                            <span className="absolute left-[11px] top-7 h-[calc(100%-0.75rem)] w-px bg-border/80" />
                          ) : null}
                          <span className="absolute left-2 top-3 size-2.5 rounded-full border border-background bg-primary/70" />
                          {item.type === 'update' ? (
                            <div
                              className={`rounded-lg border bg-card p-4 shadow-sm ${
                                highlightedUpdateId === item.update.id
                                  ? 'border-primary ring-2 ring-primary/30'
                                  : ''
                              }`}
                            >
                              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                                <p className="text-sm font-medium">
                                  {item.update.user.name}{' '}
                                  <span className="text-muted-foreground">
                                    ({item.update.user.role})
                                  </span>
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatTimeOnly(item.createdAt)}
                                </p>
                              </div>
                              <div className="space-y-2">
                                <div>
                                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    What was done
                                  </p>
                                  <p className="text-sm">{item.update.whatWasDone}</p>
                                </div>
                                {item.update.blockers ? (
                                  <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                      Blockers
                                    </p>
                                    <p className="text-sm">{item.update.blockers}</p>
                                  </div>
                                ) : null}
                                {item.update.nextSteps ? (
                                  <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                      Next steps
                                    </p>
                                    <p className="text-sm">{item.update.nextSteps}</p>
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          ) : (
                            <div className="rounded-lg border border-dashed bg-muted/25 p-3">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <p className="text-sm">
                                  <span className="font-medium">
                                    {timelineEventLabel[item.log.actionType] ?? item.log.actionType}
                                  </span>{' '}
                                  by {item.log.user.id === user?.id ? 'You' : item.log.user.name} (
                                  {item.log.user.role})
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatTimeOnly(item.createdAt)}
                                </p>
                              </div>
                            </div>
                          )}
                        </article>
                      ))}
                    </div>
                  </div>
                ));
              })()}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
