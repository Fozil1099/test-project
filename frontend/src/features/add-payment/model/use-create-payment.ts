import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api';
import { paymentApi, type PaymentInput } from '@/entities/payment';

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PaymentInput) => paymentApi.create(input),
    onSuccess: (payment) =>
      Promise.all([
        // Payment date may fall into any month, so all cached months are stale.
        queryClient.invalidateQueries({ queryKey: queryKeys.debtors.all }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.payments.byStudent(payment.studentId),
        }),
      ]),
  });
}
