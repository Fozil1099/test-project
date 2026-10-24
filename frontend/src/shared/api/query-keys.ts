export interface StudentListParams {
  search?: string;
  group?: string;
}

export const queryKeys = {
  students: {
    all: ['students'] as const,
    lists: () => [...queryKeys.students.all, 'list'] as const,
    list: (params: StudentListParams) => [...queryKeys.students.lists(), params] as const,
    detail: (id: number) => [...queryKeys.students.all, 'detail', id] as const,
  },
  payments: {
    all: ['payments'] as const,
    byStudent: (studentId: number) => [...queryKeys.payments.all, studentId] as const,
  },
  debtors: {
    all: ['debtors'] as const,
    list: (month: string) => [...queryKeys.debtors.all, month] as const,
  },
};
