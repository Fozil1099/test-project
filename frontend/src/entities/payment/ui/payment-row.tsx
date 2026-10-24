import { formatDate, formatMoney } from '@/shared/lib';
import type { Payment } from '../model/types';

export function PaymentRow({ payment }: { payment: Payment }) {
  return (
    <li data-testid="payment-row" className="flex items-center justify-between gap-3 py-3">
      <span className="text-sm text-slate-600">{formatDate(payment.paidAt)}</span>
      <span className="text-base font-semibold text-emerald-700">
        +{formatMoney(payment.amount)}
      </span>
    </li>
  );
}
