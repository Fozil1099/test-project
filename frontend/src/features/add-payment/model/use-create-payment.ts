import { useMutation, useQueryClient } from '@tanstack/react-query';
import { debtorKeys } from '@/entities/debtor';
import { paymentApi, paymentKeys, type PaymentInput } from '@/entities/payment';

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PaymentInput) => paymentApi.create(input),
    onSuccess: (payment) =>
      Promise.all([
        // Payment date may fall into any month, so all cached months are stale.
        queryClient.invalidateQueries({ queryKey: debtorKeys.all }),
        queryClient.invalidateQueries({
          queryKey: paymentKeys.byStudent(payment.studentId),
        }),
      ]),
  });
}
