import { useInfiniteQuery } from '@tanstack/react-query';
import { nextOffset, queryKeys } from '@/shared/api';
import { paymentApi } from './payment-api';

export function useStudentPayments(studentId: number) {
  return useInfiniteQuery({
    queryKey: queryKeys.payments.byStudent(studentId),
    queryFn: ({ pageParam, signal }) =>
      paymentApi.listByStudent(studentId, { offset: pageParam }, signal),
    initialPageParam: 0,
    getNextPageParam: nextOffset,
  });
}
