const formatter = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 });

export function formatMoney(value: number): string {
  return `${formatter.format(value)} сум`;
}

/** Groups digits by thousands for inputs: 1200000 -> "1 200 000". */
export function formatAmountInput(value: number | undefined): string {
  return value === undefined || Number.isNaN(value) ? '' : formatter.format(value);
}

export function parseAmountInput(raw: string): number | undefined {
  const digits = raw.replace(/\D/g, '').slice(0, 12);
  return digits ? Number(digits) : undefined;
}
