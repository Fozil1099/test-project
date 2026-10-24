import { forwardRef } from 'react';
import { formatAmountInput, parseAmountInput } from '@/shared/lib';
import { Input, type InputProps } from './input';

interface MoneyInputProps extends Omit<InputProps, 'value' | 'onChange' | 'type'> {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}

/** Numeric keypad on mobile, digits grouped by thousands, value is a plain integer. */
export const MoneyInput = forwardRef<HTMLInputElement, MoneyInputProps>(function MoneyInput(
  { value, onChange, ...rest },
  ref,
) {
  return (
    <div className="relative">
      <Input
        ref={ref}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={formatAmountInput(value)}
        onChange={(e) => onChange(parseAmountInput(e.target.value))}
        className="pr-14"
        {...rest}
      />
      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-slate-500">
        сум
      </span>
    </div>
  );
});
