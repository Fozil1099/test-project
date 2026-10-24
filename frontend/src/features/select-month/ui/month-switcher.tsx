import { currentMonth, formatMonth, isValidMonth, shiftMonth } from '@/shared/lib';

interface MonthSwitcherProps {
  value: string;
  onChange: (month: string) => void;
}

export function MonthSwitcher({ value, onChange }: MonthSwitcherProps) {
  const maxMonth = currentMonth();
  const canGoNext = value < maxMonth;
  const arrow =
    'flex size-11 shrink-0 items-center justify-center rounded-xl text-xl text-slate-700 hover:bg-slate-100 disabled:opacity-30';

  return (
    <div
      className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white p-1"
      data-testid="month-switcher"
    >
      <button
        type="button"
        className={arrow}
        aria-label="Предыдущий месяц"
        onClick={() => onChange(shiftMonth(value, -1))}
        data-testid="month-prev"
      >
        ‹
      </button>
      <label className="relative flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-xl text-base font-semibold text-slate-900 hover:bg-slate-50">
        <span data-testid="month-label">{formatMonth(value)}</span>
        {/* Native picker on top of the label: opens the OS month selector on tap. */}
        <input
          type="month"
          value={value}
          max={maxMonth}
          aria-label="Выбрать месяц"
          data-testid="month-input"
          onChange={(e) => isValidMonth(e.target.value) && onChange(e.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </label>
      <button
        type="button"
        className={arrow}
        aria-label="Следующий месяц"
        disabled={!canGoNext}
        onClick={() => onChange(shiftMonth(value, 1))}
        data-testid="month-next"
      >
        ›
      </button>
    </div>
  );
}
