import { z } from 'zod';
import { today } from '@/shared/lib';
import { MAX_AMOUNT } from '@/entities/student';

export const paymentSchema = z.object({
  studentId: z.number({
    required_error: 'Выберите ученика',
    invalid_type_error: 'Выберите ученика',
  }),
  amount: z
    .number({ required_error: 'Укажите сумму', invalid_type_error: 'Укажите сумму' })
    .int()
    .min(1, 'Сумма должна быть больше 0')
    .max(MAX_AMOUNT, 'Слишком большая сумма'),
  paidAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Укажите дату')
    .refine((v) => v <= today(), 'Дата не может быть в будущем'),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;
