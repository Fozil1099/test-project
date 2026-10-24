import { PAGE_SIZE, request, type PageParams, type Paginated } from '@/shared/api';
import type { Payment, PaymentInput } from '../model/types';

export const paymentApi = {
  create: (input: PaymentInput) => request<Payment>('/payments', { method: 'POST', body: input }),
  listByStudent: (studentId: number, params: PageParams = {}, signal?: AbortSignal) =>
    request<Paginated<Payment>>(`/students/${studentId}/payments`, {
      query: { limit: PAGE_SIZE, offset: 0, ...params },
      signal,
    }),
};
