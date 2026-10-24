import { PAGE_SIZE, request, type PageParams } from '@/shared/api';
import type { DebtorsPage } from '../model/types';

export const debtorApi = {
  list: (month: string, params: PageParams = {}, signal?: AbortSignal) =>
    request<DebtorsPage>('/debtors', {
      query: { month, limit: PAGE_SIZE, offset: 0, ...params },
      signal,
    }),
};
