import { Skeleton } from "@opsflow/ui/components/skeleton";

export function TasksTableSkeleton() {
  return (
    <div className="rounded-lg border">
      <div className="grid grid-cols-5 gap-4 border-b px-4 py-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-20" />
        ))}
      </div>
      <div className="space-y-2 p-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="grid grid-cols-5 gap-4 py-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
