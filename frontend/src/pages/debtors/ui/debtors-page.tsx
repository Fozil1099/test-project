import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AddPaymentSheet } from '@/features/add-payment';
import { MonthSwitcher } from '@/features/select-month';
import { currentMonth, isValidMonth } from '@/shared/lib';
import { Button } from '@/shared/ui';
import { DebtorsList } from '@/widgets/debtors-list';
import { PageHeader } from '@/widgets/page-header';

export function DebtorsPage() {
  const [params, setParams] = useSearchParams();
  const raw = params.get('month');
  const month = isValidMonth(raw) ? raw : currentMonth();
  const [paying, setPaying] = useState(false);

  return (
    <>
      <PageHeader
        title="Должники"
        actions={
          <Button size="sm" onClick={() => setPaying(true)} data-testid="add-payment-open">
            + Оплата
          </Button>
        }
      />
      <main className="mx-auto flex max-w-xl flex-col gap-4 px-4 py-4">
        <MonthSwitcher value={month} onChange={(m) => setParams({ month: m }, { replace: true })} />
        <DebtorsList month={month} />
      </main>
      <AddPaymentSheet open={paying} onClose={() => setPaying(false)} />
    </>
  );
}
