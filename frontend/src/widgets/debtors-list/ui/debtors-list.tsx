import { useState } from 'react';
import { DebtorCard, useDebtors, type Debtor } from '@/entities/debtor';
import { AddPaymentSheet, type PaymentPreset } from '@/features/add-payment';
import { formatMoney, formatMonth } from '@/shared/lib';
import { Button, CardSkeletonList, EmptyState, ErrorState, LoadMore } from '@/shared/ui';

export function DebtorsList({ month }: { month: string }) {
  const {
    data,
    isPending,
    isError,
    error,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useDebtors(month);
  const [preset, setPreset] = useState<PaymentPreset | null>(null);

  const openPayment = (d: Debtor) =>
    setPreset({ student: { id: d.id, name: d.name }, amount: d.debt });

  if (isPending) return <CardSkeletonList />;
  if (isError) return <ErrorState message={error.message} onRetry={() => refetch()} />;

  const firstPage = data.pages[0];
  const debtors = data.pages.flatMap((p) => p.items);

  return (
    <section aria-label="Должники" className="flex flex-col gap-3">
      <div
        className="flex items-center justify-between gap-4 rounded-2xl bg-rose-50 p-4"
        data-testid="debtors-summary"
      >
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-rose-700">Общий долг</p>
          <p
            className="mt-1 whitespace-nowrap text-xl font-bold text-rose-700"
            data-testid="total-debt"
          >
            {formatMoney(firstPage.totalDebt)}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs uppercase tracking-wide text-rose-700">Должников</p>
          <p className="mt-1 text-xl font-bold text-rose-700" data-testid="debtors-total">
            {firstPage.total}
          </p>
        </div>
      </div>

      {debtors.length === 0 ? (
        <EmptyState
          testId="debtors-empty"
          title="Должников нет"
          description={`За ${formatMonth(month).toLowerCase()} все ученики оплатили обучение.`}
        />
      ) : (
        <>
          <ul className="flex flex-col gap-3" data-testid="debtors-list">
            {debtors.map((d) => (
              <li key={d.id}>
                <DebtorCard
                  debtor={d}
                  actions={
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => openPayment(d)}
                      data-testid="debtor-pay"
                    >
                      Оплатить
                    </Button>
                  }
                />
              </li>
            ))}
          </ul>
          <LoadMore
            hasMore={!!hasNextPage}
            loading={isFetchingNextPage}
            onLoadMore={() => fetchNextPage()}
            shown={debtors.length}
            total={firstPage.total}
          />
        </>
      )}

      <AddPaymentSheet
        open={!!preset}
        onClose={() => setPreset(null)}
        preset={preset ?? undefined}
      />
    </section>
  );
}
