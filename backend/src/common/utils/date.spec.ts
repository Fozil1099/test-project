import { isCalendarDate, monthRange, todayIn } from './date';

describe('monthRange', () => {
  it('returns a half-open range for a regular month', () => {
    expect(monthRange('2026-10')).toEqual({ start: '2026-10-01', end: '2026-11-01' });
  });

  it('rolls over to the next year in December', () => {
    expect(monthRange('2026-12')).toEqual({ start: '2026-12-01', end: '2027-01-01' });
  });

  it('handles February in a leap year without hardcoding month length', () => {
    expect(monthRange('2028-02')).toEqual({ start: '2028-02-01', end: '2028-03-01' });
  });

  it.each(['2026-13', '2026-00', '2026-1', '26-01', '2026-01-01', ''])('rejects %p', (value) => {
    expect(() => monthRange(value)).toThrow();
  });
});

describe('isCalendarDate', () => {
  it.each(['2026-01-31', '2028-02-29', '2026-12-01'])('accepts %p', (value) => {
    expect(isCalendarDate(value)).toBe(true);
  });

  it.each(['2026-02-30', '2027-02-29', '2026-13-01', '2026-1-1', '2026-01-01T00:00:00Z'])(
    'rejects %p',
    (value) => {
      expect(isCalendarDate(value)).toBe(false);
    },
  );
});

describe('todayIn', () => {
  it('uses the given time zone, not UTC', () => {
    // 2026-10-31 20:30 UTC is already 2026-11-01 in Tashkent (UTC+5)
    const now = new Date('2026-10-31T20:30:00Z');
    expect(todayIn('Asia/Tashkent', now)).toBe('2026-11-01');
    expect(todayIn('UTC', now)).toBe('2026-10-31');
  });
});
