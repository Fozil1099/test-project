export const debtorKeys = {
  all: ['debtors'] as const,
  list: (month: string) => [...debtorKeys.all, month] as const,
};
