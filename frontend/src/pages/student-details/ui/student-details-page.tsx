import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PaymentRow, useStudentPayments } from '@/entities/payment';
import { useStudent, type Student } from '@/entities/student';
import { AddPaymentSheet } from '@/features/add-payment';
import { DeleteStudentButton } from '@/features/delete-student';
import { EditStudentButton } from '@/features/edit-student';
import { ApiError } from '@/shared/api';
import { formatDate, formatMoney, formatPhone } from '@/shared/lib';
import {
  Button,
  Card,
  CardSkeletonList,
  EmptyState,
  ErrorState,
  LoadMore,
  Skeleton,
} from '@/shared/ui';
import { PageHeader } from '@/widgets/page-header';

export function StudentDetailsPage() {
  const id = Number(useParams().id);
  const navigate = useNavigate();
  const valid = Number.isInteger(id) && id > 0;
  const student = useStudent(valid ? id : 0);

  if (!valid || (student.error instanceof ApiError && student.error.statusCode === 404)) {
    return (
      <>
        <PageHeader title="Ученик" backTo="/students" />
        <EmptyState
          testId="student-not-found"
          title="Ученик не найден"
          description="Возможно, он был удалён."
        />
      </>
    );
  }

  return (
    <>
      <PageHeader title={student.data?.name ?? 'Ученик'} backTo="/students" />
      <main className="mx-auto flex max-w-xl flex-col gap-4 px-4 py-4">
        {student.isPending ? (
          <Card>
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="mt-3 h-4 w-1/2" />
            <Skeleton className="mt-2 h-4 w-1/3" />
          </Card>
        ) : student.isError ? (
          <ErrorState message={student.error.message} onRetry={() => student.refetch()} />
        ) : (
          <StudentInfo
            student={student.data}
            onDeleted={() => navigate('/students', { replace: true })}
          />
        )}
        {/* Payments load in parallel with the student, not after it (no waterfall). */}
        <PaymentsHistory studentId={id} />
      </main>
    </>
  );
}

function StudentInfo({ student, onDeleted }: { student: Student; onDeleted: () => void }) {
  const [paying, setPaying] = useState(false);

  return (
    <Card data-testid="student-info">
      <dl className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-2 text-sm">
        <dt className="text-slate-500">Группа</dt>
        <dd className="font-medium text-slate-900">{student.group}</dd>
        <dt className="text-slate-500">Телефон</dt>
        <dd>
          <a href={`tel:${student.phone}`} className="font-medium text-indigo-600">
            {formatPhone(student.phone)}
          </a>
        </dd>
        <dt className="text-slate-500">В месяц</dt>
        <dd className="font-medium text-slate-900">{formatMoney(student.monthlyFee)}</dd>
        <dt className="text-slate-500">С нами с</dt>
        <dd className="text-slate-900">{formatDate(student.createdAt)}</dd>
      </dl>
      <div className="mt-4 flex flex-col gap-2">
        <Button block onClick={() => setPaying(true)} data-testid="student-pay">
          Принять оплату
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <EditStudentButton student={student} />
          <DeleteStudentButton student={student} onDeleted={onDeleted} />
        </div>
      </div>
      <AddPaymentSheet
        open={paying}
        onClose={() => setPaying(false)}
        preset={{
          student: { id: student.id, name: student.name },
          amount: student.monthlyFee,
          amountHint: `Сумма в месяц: ${formatMoney(student.monthlyFee)}`,
        }}
      />
    </Card>
  );
}

function PaymentsHistory({ studentId }: { studentId: number }) {
  const {
    data,
    isPending,
    isError,
    error,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useStudentPayments(studentId);

  const payments = data?.pages.flatMap((p) => p.items) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  return (
    <section aria-labelledby="payments-title">
      <h2 id="payments-title" className="mb-2 text-base font-semibold text-slate-900">
        История оплат
      </h2>
      {isPending ? (
        <CardSkeletonList count={2} />
      ) : isError ? (
        <ErrorState message={error.message} onRetry={() => refetch()} />
      ) : payments.length === 0 ? (
        <EmptyState testId="payments-empty" title="Оплат пока нет" />
      ) : (
        <Card className="py-1">
          <ul className="divide-y divide-slate-100" data-testid="payments-list">
            {payments.map((p) => (
              <PaymentRow key={p.id} payment={p} />
            ))}
          </ul>
          <LoadMore
            hasMore={!!hasNextPage}
            loading={isFetchingNextPage}
            onLoadMore={() => fetchNextPage()}
            shown={payments.length}
            total={total}
          />
        </Card>
      )}
    </section>
  );
}
