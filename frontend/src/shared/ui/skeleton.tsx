import { cn } from '@/shared/lib';

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('animate-pulse rounded-lg bg-slate-200', className)} />;
}

export function CardSkeletonList({ count = 4 }: { count?: number }) {
  return (
    <div
      className="flex flex-col gap-3"
      data-testid="list-skeleton"
      aria-busy="true"
      aria-label="Загрузка"
    >
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="mt-2 h-4 w-1/3" />
          <Skeleton className="mt-4 h-4 w-full" />
        </div>
      ))}
    </div>
  );
}
