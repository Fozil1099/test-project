export class PaymentEntity {
  id: number;
  studentId: number;
  amount: number;
  /** YYYY-MM-DD */
  paidAt: string;
  createdAt: Date;
}

export class PaymentListEntity {
  items: PaymentEntity[];
  total: number;
}
