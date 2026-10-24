import { useInfiniteQuery } from '@tanstack/react-query';
import { nextOffset } from '@/shared/api';
import { debtorKeys } from './query-keys';
import { debtorApi } from './debtor-api';

export function useDebtors(month: string) {
  return useInfiniteQuery({
    queryKey: debtorKeys.list(month),
    queryFn: ({ pageParam, signal }) => debtorApi.list(month, { offset: pageParam }, signal),
    initialPageParam: 0,
    getNextPageParam: nextOffset,
  });
}
