const pad = (n: number) => String(n).padStart(2, '0');

/** Month in `YYYY-MM`, local time. */
export function currentMonth(date = new Date()): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

/** Date in `YYYY-MM-DD`, local time (not UTC, so late evening is still "today"). */
export function today(date = new Date()): string {
  return `${currentMonth(date)}-${pad(date.getDate())}`;
}

export const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

export function isValidMonth(value: string | null | undefined): value is string {
  return !!value && MONTH_RE.test(value);
}

export function shiftMonth(month: string, delta: number): string {
  const [year, m] = month.split('-').map(Number);
  return currentMonth(new Date(year, m - 1 + delta, 1));
}

export function formatMonth(month: string): string {
  const [year, m] = month.split('-').map(Number);
  const label = new Date(year, m - 1, 1).toLocaleDateString('ru-RU', {
    month: 'long',
    year: 'numeric',
  });
  return label.charAt(0).toUpperCase() + label.slice(1).replace(/\s*г\.$/, '');
}

/** `YYYY-MM-DD` or ISO string -> "24 окт. 2026". */
export function formatDate(value: string): string {
  const [y, m, d] = value.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
