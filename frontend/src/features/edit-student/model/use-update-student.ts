import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api';
import { studentApi, type StudentInput } from '@/entities/student';

export function useUpdateStudent(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<StudentInput>) => studentApi.update(id, input),
    onSuccess: (student) => {
      queryClient.setQueryData(queryKeys.students.detail(id), student);
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.students.lists() }),
        // Fee, name or group changes are visible in the debtors list.
        queryClient.invalidateQueries({ queryKey: queryKeys.debtors.all }),
      ]);
    },
  });
}
