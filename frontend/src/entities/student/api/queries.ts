import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { nextOffset, queryKeys, type StudentListParams } from '@/shared/api';
import { studentApi } from './student-api';

export function useStudentsInfinite(
  params: StudentListParams,
  options: { enabled?: boolean } = {},
) {
  return useInfiniteQuery({
    queryKey: queryKeys.students.list(params),
    queryFn: ({ pageParam, signal }) => studentApi.list({ ...params, offset: pageParam }, signal),
    initialPageParam: 0,
    getNextPageParam: nextOffset,
    placeholderData: keepPreviousData,
    enabled: options.enabled,
  });
}

/** Small list for pickers: one page, no pagination. */
export function useStudentSearch(search: string, enabled = true) {
  return useQuery({
    queryKey: [...queryKeys.students.list({ search }), 'picker'],
    queryFn: ({ signal }) => studentApi.list({ search, limit: 10 }, signal),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useStudent(id: number) {
  return useQuery({
    queryKey: queryKeys.students.detail(id),
    queryFn: ({ signal }) => studentApi.get(id, signal),
    enabled: id > 0,
  });
}
