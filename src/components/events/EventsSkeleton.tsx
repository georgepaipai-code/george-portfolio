import { Skeleton } from "@/components/ui/skeleton";

export function EventsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex gap-4 rounded-lg border border-card-border bg-card p-4">
          <Skeleton className="h-20 w-20 flex-shrink-0 rounded-md sm:h-24 sm:w-24" />
          <div className="flex flex-1 flex-col justify-center gap-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
