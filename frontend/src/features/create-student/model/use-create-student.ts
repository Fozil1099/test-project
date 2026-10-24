import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api';
import { studentApi, type StudentInput } from '@/entities/student';

export function useCreateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: StudentInput) => studentApi.create(input),
    onSuccess: (student) => {
      queryClient.setQueryData(queryKeys.students.detail(student.id), student);
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.students.lists() }),
        // A new student with no payments is a debtor for the current month.
        queryClient.invalidateQueries({ queryKey: queryKeys.debtors.all }),
      ]);
    },
  });
}
