import { Button } from './button';

interface LoadMoreProps {
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  shown: number;
  total: number;
}

export function LoadMore({ hasMore, loading, onLoadMore, shown, total }: LoadMoreProps) {
  return (
    <div className="flex flex-col items-center gap-2 py-4">
      <p className="text-sm text-slate-500" data-testid="list-counter">
        Показано {shown} из {total}
      </p>
      {hasMore && (
        <Button variant="secondary" loading={loading} onClick={onLoadMore} data-testid="load-more">
          Показать ещё
        </Button>
      )}
    </div>
  );
}
