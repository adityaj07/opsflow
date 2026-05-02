import { motion } from 'framer-motion';
import { Button } from '@opsflow/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@opsflow/ui/components/card';
import { Skeleton } from '@opsflow/ui/components/skeleton';
import { Link } from 'react-router';
import { useShallow } from 'zustand/react/shallow';

import {
  useDashboardActivityQuery,
  useDashboardOverviewQuery,
} from '@/features/dashboard/hooks/use-dashboard';
import { getApiErrorMessage } from '@/lib/utils/http';
import { useAppStore } from '@/store';

const entryMotion = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso));

const formatDateLabel = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(d);
};

const formatTimeOnly = (iso: string) =>
  new Intl.DateTimeFormat('en-IN', { timeStyle: 'short' }).format(new Date(iso));

export default function DashboardRoute() {
  const { user } = useAppStore(useShallow(state => ({ user: state.user })));
  const overviewQuery = useDashboardOverviewQuery(Boolean(user));
  const activityQuery = useDashboardActivityQuery(Boolean(user));

  const isLoading = overviewQuery.isLoading || activityQuery.isLoading;
  const hasError = overviewQuery.isError || activityQuery.isError;
  const errorMessage = overviewQuery.isError
    ? getApiErrorMessage(overviewQuery.error)
    : activityQuery.isError
      ? getApiErrorMessage(activityQuery.error)
      : '';

  if (isLoading) {
    return (
      <section className="space-y-6">
        <header className="space-y-1">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-5 w-72" />
        </header>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-28" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-44" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      </section>
    );
  }

  if (hasError) {
    return (
      <section className="space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Could not load your dashboard right now.</p>
        </header>
        <Card className="border-dashed">
          <CardContent className="space-y-4 py-8">
            <p className="text-sm text-muted-foreground">{errorMessage}</p>
            <Button
              onClick={() => {
                overviewQuery.refetch();
                activityQuery.refetch();
              }}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  const overview = overviewQuery.data;
  const activity = activityQuery.data;

  if (!overview || !activity) {
    return (
      <section className="space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Dashboard data is currently unavailable.</p>
        </header>
      </section>
    );
  }

  const cardsByRole =
    overview.role === 'ADMIN'
      ? [
          { label: 'Total Tasks', value: overview.total, tone: 'text-foreground' },
          {
            label: 'In Progress',
            value: overview.inProgress,
            tone: 'text-blue-600 dark:text-blue-400',
          },
          { label: 'Done', value: overview.done, tone: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Other', value: overview.other, tone: 'text-zinc-600 dark:text-zinc-400' },
        ]
      : overview.role === 'MANAGER'
        ? [
            {
              label: 'Tasks Created By Me',
              value: overview.tasksCreatedByMe,
              tone: 'text-foreground',
            },
            {
              label: 'In Progress',
              value: overview.inProgress,
              tone: 'text-blue-600 dark:text-blue-400',
            },
            { label: 'Done', value: overview.done, tone: 'text-emerald-600 dark:text-emerald-400' },
            {
              label: 'Blocked / Other',
              value: overview.other,
              tone: 'text-rose-600 dark:text-rose-400',
            },
          ]
        : [
            { label: 'My Tasks', value: overview.myTasks, tone: 'text-foreground' },
            {
              label: 'In Progress',
              value: overview.inProgress,
              tone: 'text-blue-600 dark:text-blue-400',
            },
            { label: 'Done', value: overview.done, tone: 'text-emerald-600 dark:text-emerald-400' },
          ];

  const feedTitle =
    overview.role === 'ADMIN'
      ? 'Recent Activity'
      : overview.role === 'MANAGER'
        ? 'Recent Updates On My Tasks'
        : 'My Recent Updates / Assigned Work';

  return (
    <section className="space-y-6">
      <motion.header
        initial="hidden"
        animate="visible"
        variants={entryMotion}
        transition={{ duration: 0.22 }}
        className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{`Welcome back, ${user?.name}`}</h1>
          <p className="text-muted-foreground">
            {overview.role === 'ADMIN'
              ? 'System overview and execution monitoring.'
              : overview.role === 'MANAGER'
                ? 'Track team progress and keep delivery moving.'
                : 'Focus on your active work and recent updates.'}
          </p>
        </div>
        <Button variant="outline" render={<Link to="/app/tasks" />}>
          Open Tasks
        </Button>
      </motion.header>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={entryMotion}
        transition={{ duration: 0.22, delay: 0.05 }}
        className={`grid gap-4 sm:grid-cols-2 ${cardsByRole.length === 4 ? 'xl:grid-cols-4' : 'xl:grid-cols-3'}`}
      >
        {cardsByRole.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, delay: 0.05 + index * 0.04 }}
          >
            <Card className="transition-colors hover:bg-muted/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-3xl font-semibold tracking-tight ${card.tone}`}>{card.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={entryMotion}
        transition={{ duration: 0.22, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold">{feedTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            {activity.items.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <p className="text-sm text-muted-foreground">No recent activity yet.</p>
                <Button className="mt-4" render={<Link to="/app/tasks" />}>
                  Go to Tasks
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {(() => {
                  const groups: Record<string, typeof activity.items> = {};
                  const order: string[] = [];
                  activity.items.forEach(item => {
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
                      <div className="space-y-3">
                        {groups[label].map(item => {
                          const actorName = item.actor.id === user?.id ? 'You' : item.actor.name;
                          return (
                            <article key={item.id} className="rounded-lg border p-4">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm">
                          <span className="font-medium">{actorName}</span>{' '}
                          <span className="text-muted-foreground">({item.actor.role})</span>{' '}
                          {item.type === 'update' && (overview.role === 'ADMIN' || overview.role === 'MANAGER') ? (
                            <Link
                              to={`/app/tasks/${item.taskId}?updateId=${item.updateId ?? ''}`}
                              className="font-medium underline-offset-4 hover:underline"
                            >
                              {item.summary}
                            </Link>
                          ) : (
                            item.summary
                          )}{' '}
                          on{' '}
                          <Link
                            to={`/app/tasks/${item.taskId}`}
                            className="font-medium hover:underline"
                          >
                                    {item.taskTitle}
                                  </Link>
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatTimeOnly(item.createdAt)}
                                </p>
                              </div>
                              {item.type === 'update' ? (
                                <div className="mt-3 space-y-2 rounded-md border border-dashed bg-muted/20 p-3">
                                  <p className="text-sm">
                                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                      What
                                    </span>
                                    <br />
                                    {item.whatWasDone}
                                  </p>
                                  {item.blockers ? (
                                    <p className="text-sm">
                                      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                        Blockers
                                      </span>
                                      <br />
                                      {item.blockers}
                                    </p>
                                  ) : null}
                                  {item.nextSteps ? (
                                    <p className="text-sm">
                                      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                        Next
                                      </span>
                                      <br />
                                      {item.nextSteps}
                                    </p>
                                  ) : null}
                                </div>
                              ) : null}
                            </article>
                          );
                        })}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}
