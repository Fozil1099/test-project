import { useInfiniteQuery } from '@tanstack/react-query';
import { nextOffset, queryKeys } from '@/shared/api';
import { debtorApi } from './debtor-api';

export function useDebtors(month: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.debtors.list(month),
    queryFn: ({ pageParam, signal }) => debtorApi.list(month, { offset: pageParam }, signal),
    initialPageParam: 0,
    getNextPageParam: nextOffset,
  });
}
