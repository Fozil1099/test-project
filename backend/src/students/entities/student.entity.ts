export class StudentEntity {
  id: number;
  name: string;
  phone: string;
  group: string;
  monthlyFee: number;
  createdAt: Date;
}

export class StudentListEntity {
  items: StudentEntity[];
  total: number;
}
