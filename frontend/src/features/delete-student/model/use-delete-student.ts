import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api';
import { studentApi } from '@/entities/student';

export function useDeleteStudent(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => studentApi.remove(id),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.students.detail(id) });
      queryClient.removeQueries({ queryKey: queryKeys.payments.byStudent(id) });
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.students.lists() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.debtors.all }),
      ]);
    },
  });
}
