export const MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;
export const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export interface MonthRange {
  /** First day of the month, YYYY-MM-DD (inclusive). */
  start: string;
  /** First day of the next month, YYYY-MM-DD (exclusive). */
  end: string;
}

/** Converts "YYYY-MM" to a half-open range [start; end) of calendar dates. */
export function monthRange(month: string): MonthRange {
  if (!MONTH_REGEX.test(month)) {
    throw new Error(`Invalid month: ${month}`);
  }
  const [year, mon] = month.split('-').map(Number);
  const nextYear = mon === 12 ? year + 1 : year;
  const nextMon = mon === 12 ? 1 : mon + 1;
  return {
    start: `${year}-${pad(mon)}-01`,
    end: `${nextYear}-${pad(nextMon)}-01`,
  };
}

/** True when the string is a real calendar date in YYYY-MM-DD form. */
export function isCalendarDate(value: string): boolean {
  if (!DATE_REGEX.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && toDateString(date) === value;
}

/** Today's date (YYYY-MM-DD) in the given IANA time zone. */
export function todayIn(timeZone: string, now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

/** Formats a Prisma @db.Date value (UTC midnight) as YYYY-MM-DD. */
export function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}
