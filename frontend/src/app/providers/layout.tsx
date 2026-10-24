import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { CardSkeletonList } from '@/shared/ui';
import { BottomNav } from '@/widgets/bottom-nav';

export function Layout() {
  return (
    <div className="min-h-dvh pb-[calc(3.5rem+env(safe-area-inset-bottom))]">
      <Suspense
        fallback={
          <div className="mx-auto max-w-xl px-4 pt-20">
            <CardSkeletonList />
          </div>
        }
      >
        <Outlet />
      </Suspense>
      <BottomNav />
    </div>
  );
}
