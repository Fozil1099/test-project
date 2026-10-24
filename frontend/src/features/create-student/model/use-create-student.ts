import { useMutation, useQueryClient } from '@tanstack/react-query';
import { debtorKeys } from '@/entities/debtor';
import { studentApi, studentKeys, type StudentInput } from '@/entities/student';

export function useCreateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: StudentInput) => studentApi.create(input),
    onSuccess: (student) => {
      queryClient.setQueryData(studentKeys.detail(student.id), student);
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: studentKeys.lists() }),
        // A new student with no payments is a debtor for the current month.
        queryClient.invalidateQueries({ queryKey: debtorKeys.all }),
      ]);
    },
  });
}
