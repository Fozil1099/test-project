import { Input } from '@/shared/ui';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  testId?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Поиск по имени или телефону',
  testId = 'student-search',
}: SearchInputProps) {
  return (
    <div className="relative">
      <span
        className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400"
        aria-hidden
      >
        <svg
          viewBox="0 0 20 20"
          fill="none"
          className="size-5"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <circle cx="9" cy="9" r="6" />
          <path d="m14 14 3.5 3.5" strokeLinecap="round" />
        </svg>
      </span>
      <Input
        type="search"
        enterKeyHint="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="pl-10"
        data-testid={testId}
      />
    </div>
  );
}
