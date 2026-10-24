import { useState } from 'react';
import { StudentCard, useStudentsInfinite } from '@/entities/student';
import { SearchInput } from '@/features/search-students';
import { useDebounce } from '@/shared/lib';
import { CardSkeletonList, EmptyState, ErrorState, LoadMore } from '@/shared/ui';

export function StudentsList() {
  const [query, setQuery] = useState('');
  const search = useDebounce(query.trim(), 300);
  const {
    data,
    isPending,
    isError,
    error,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isPlaceholderData,
  } = useStudentsInfinite({ search: search || undefined });

  const students = data?.pages.flatMap((p) => p.items) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  return (
    <section aria-label="Ученики" className="flex flex-col gap-3">
      <SearchInput value={query} onChange={setQuery} />

      {isPending ? (
        <CardSkeletonList />
      ) : isError ? (
        <ErrorState message={error.message} onRetry={() => refetch()} />
      ) : students.length === 0 ? (
        <EmptyState
          testId="students-empty"
          title={search ? 'Никого не нашли' : 'Учеников пока нет'}
          description={
            search ? 'Попробуйте изменить запрос.' : 'Добавьте первого ученика кнопкой сверху.'
          }
        />
      ) : (
        <div className={isPlaceholderData ? 'opacity-60 transition-opacity' : undefined}>
          <ul className="flex flex-col gap-3" data-testid="students-list">
            {students.map((s) => (
              <li key={s.id}>
                <StudentCard student={s} />
              </li>
            ))}
          </ul>
          <LoadMore
            hasMore={!!hasNextPage}
            loading={isFetchingNextPage}
            onLoadMore={() => fetchNextPage()}
            shown={students.length}
            total={total}
          />
        </div>
      )}
    </section>
  );
}
