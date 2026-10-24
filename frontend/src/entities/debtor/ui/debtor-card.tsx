import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { formatMoney, formatPhone } from '@/shared/lib';
import type { Debtor } from '../model/types';

interface DebtorCardProps {
  debtor: Debtor;
  /** Slot for actions from upper layers (e.g. the pay button). */
  actions?: ReactNode;
}

export function DebtorCard({ debtor, actions }: DebtorCardProps) {
  const progress = Math.min(100, Math.round((debtor.paid / debtor.monthlyFee) * 100));

  return (
    <article
      data-testid="debtor-card"
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            to={`/students/${debtor.id}`}
            className="block truncate text-base font-semibold text-slate-900 hover:underline"
          >
            {debtor.name}
          </Link>
          <p className="mt-0.5 truncate text-sm text-slate-500">{debtor.group}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs uppercase tracking-wide text-slate-500">Долг</p>
          <p className="text-lg font-bold text-rose-600" data-testid="debtor-debt">
            {formatMoney(debtor.debt)}
          </p>
        </div>
      </div>

      <div className="mt-3">
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100" aria-hidden>
          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-1.5 text-sm text-slate-600">
          Оплачено <span className="font-medium text-slate-900">{formatMoney(debtor.paid)}</span> из{' '}
          {formatMoney(debtor.monthlyFee)}
        </p>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <a
          href={`tel:${debtor.phone}`}
          data-testid="debtor-phone"
          aria-label={`Позвонить ${formatPhone(debtor.phone)}`}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-slate-200 px-2 text-sm font-medium text-slate-700 active:bg-slate-50"
        >
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="size-4 shrink-0 text-slate-400"
            aria-hidden
          >
            <path d="M3 4.5A1.5 1.5 0 0 1 4.5 3h2.1a1 1 0 0 1 1 .8l.6 3a1 1 0 0 1-.5 1.1l-1.3.7a11 11 0 0 0 5 5l.7-1.3a1 1 0 0 1 1.1-.5l3 .6a1 1 0 0 1 .8 1v2.1a1.5 1.5 0 0 1-1.5 1.5H15C8.4 17 3 11.6 3 5v-.5Z" />
          </svg>
          {formatPhone(debtor.phone).replace('+998 ', '')}
        </a>
        {actions}
      </div>
    </article>
  );
}
