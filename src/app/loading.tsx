import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="container space-y-8 py-16">
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-12 w-80" />
        <Skeleton className="h-10 w-48" />
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    </div>
  );
}
