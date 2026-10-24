import { useState } from 'react';
import { useStudentSearch } from '@/entities/student';
import { cn, formatPhone, useDebounce } from '@/shared/lib';
import { Input, Spinner } from '@/shared/ui';

export interface PickedStudent {
  id: number;
  name: string;
}

interface StudentPickerProps {
  id?: string;
  value: PickedStudent | null;
  onChange: (student: PickedStudent | null) => void;
  invalid?: boolean;
}

/** Server-side search with 300 ms debounce: never loads the whole student list. */
export function StudentPicker({ id, value, onChange, invalid }: StudentPickerProps) {
  const [query, setQuery] = useState('');
  const search = useDebounce(query.trim(), 300);
  const { data, isFetching, isError } = useStudentSearch(search, !value && search.length > 0);

  if (value) {
    return (
      <div
        className="flex min-h-11 items-center justify-between gap-2 rounded-xl border border-slate-300 bg-slate-50 pl-3"
        data-testid="picked-student"
      >
        <span className="truncate font-medium text-slate-900">{value.name}</span>
        <button
          type="button"
          className="min-h-11 px-3 text-sm font-medium text-indigo-600"
          onClick={() => onChange(null)}
        >
          Сменить
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Input
          id={id}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Начните вводить имя или телефон"
          aria-invalid={invalid}
          autoComplete="off"
          data-testid="payment-student-search"
        />
        {isFetching && <Spinner className="absolute right-3 top-3.5 text-slate-400" />}
      </div>
      {search.length > 0 && data && (
        <ul
          className="max-h-56 overflow-y-auto rounded-xl border border-slate-200"
          role="listbox"
          data-testid="payment-student-options"
        >
          {data.items.length === 0 ? (
            <li className="px-3 py-3 text-sm text-slate-500">Никого не нашли</li>
          ) : (
            data.items.map((s) => (
              <li key={s.id} role="option" aria-selected={false}>
                <button
                  type="button"
                  onClick={() => onChange({ id: s.id, name: s.name })}
                  className={cn(
                    'flex min-h-11 w-full flex-col items-start px-3 py-2 text-left hover:bg-slate-50 active:bg-slate-100',
                  )}
                >
                  <span className="font-medium text-slate-900">{s.name}</span>
                  <span className="text-xs text-slate-500">
                    {s.group} · {formatPhone(s.phone)}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
      {isError && <p className="text-sm text-rose-600">Не удалось выполнить поиск</p>}
    </div>
  );
}
