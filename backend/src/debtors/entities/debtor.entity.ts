export class DebtorEntity {
  id: number;
  name: string;
  phone: string;
  group: string;
  monthlyFee: number;
  /** Sum of payments within the month */
  paid: number;
  /** monthlyFee - paid, always > 0 */
  debt: number;
}

export class DebtorListEntity {
  /** YYYY-MM */
  month: string;
  items: DebtorEntity[];
  /** Number of debtors in the month (all pages) */
  total: number;
  /** Sum of debt over all debtors in the month (all pages) */
  totalDebt: number;
}
