import { useMutation, useQueryClient } from '@tanstack/react-query';
import { debtorKeys } from '@/entities/debtor';
import { paymentKeys } from '@/entities/payment';
import { studentApi, studentKeys } from '@/entities/student';

export function useDeleteStudent(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => studentApi.remove(id),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: studentKeys.detail(id) });
      queryClient.removeQueries({ queryKey: paymentKeys.byStudent(id) });
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: studentKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: debtorKeys.all }),
      ]);
    },
  });
}
