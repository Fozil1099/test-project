export const paymentKeys = {
  all: ['payments'] as const,
  byStudent: (studentId: number) => [...paymentKeys.all, studentId] as const,
};
