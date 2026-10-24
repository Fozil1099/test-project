import type { Paginated } from '@/shared/api';

export interface Debtor {
  id: number;
  name: string;
  phone: string;
  group: string;
  monthlyFee: number;
  paid: number;
  debt: number;
}

export interface DebtorsPage extends Paginated<Debtor> {
  month: string;
  totalDebt: number;
}
