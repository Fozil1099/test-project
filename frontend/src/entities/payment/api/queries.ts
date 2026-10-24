import { useInfiniteQuery } from '@tanstack/react-query';
import { nextOffset } from '@/shared/api';
import { paymentKeys } from './query-keys';
import { paymentApi } from './payment-api';

export function useStudentPayments(studentId: number) {
  return useInfiniteQuery({
    queryKey: paymentKeys.byStudent(studentId),
    queryFn: ({ pageParam, signal }) =>
      paymentApi.listByStudent(studentId, { offset: pageParam }, signal),
    initialPageParam: 0,
    getNextPageParam: nextOffset,
  });
}
