import { Link } from 'react-router-dom';
import { formatMoney, formatPhone } from '@/shared/lib';

interface StudentCardProps {
  student: { id: number; name: string; phone: string; group: string; monthlyFee: number };
}

export function StudentCard({ student }: StudentCardProps) {
  return (
    <Link
      to={`/students/${student.id}`}
      data-testid="student-card"
      className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors active:bg-slate-50"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-slate-900">{student.name}</p>
          <p className="mt-0.5 text-sm text-slate-500">
            {student.group} · {formatPhone(student.phone)}
          </p>
        </div>
        <p className="shrink-0 text-sm font-medium text-slate-700">
          {formatMoney(student.monthlyFee)}
        </p>
      </div>
    </Link>
  );
}
