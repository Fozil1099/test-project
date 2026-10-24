import { useMutation, useQueryClient } from '@tanstack/react-query';
import { debtorKeys } from '@/entities/debtor';
import { studentApi, studentKeys, type StudentInput } from '@/entities/student';

export function useUpdateStudent(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<StudentInput>) => studentApi.update(id, input),
    onSuccess: (student) => {
      queryClient.setQueryData(studentKeys.detail(id), student);
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: studentKeys.lists() }),
        // Fee, name or group changes are visible in the debtors list.
        queryClient.invalidateQueries({ queryKey: debtorKeys.all }),
      ]);
    },
  });
}
