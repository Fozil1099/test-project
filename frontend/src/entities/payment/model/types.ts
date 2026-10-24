export interface Payment {
  id: number;
  studentId: number;
  amount: number;
  paidAt: string;
  createdAt: string;
}

export type PaymentInput = Pick<Payment, 'studentId' | 'amount' | 'paidAt'>;
