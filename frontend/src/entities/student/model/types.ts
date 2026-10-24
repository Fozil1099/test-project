export interface Student {
  id: number;
  name: string;
  phone: string;
  group: string;
  monthlyFee: number;
  createdAt: string;
}

export type StudentInput = Pick<Student, 'name' | 'phone' | 'group' | 'monthlyFee'>;
