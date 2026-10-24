import { z } from 'zod';
import { PHONE_RE } from '@/shared/lib';

export const MAX_AMOUNT = 100_000_000;

/** Mirrors backend DTO validation (create-student.dto). */
export const studentSchema = z.object({
  name: z.string().trim().min(2, 'Минимум 2 символа').max(100, 'Максимум 100 символов'),
  phone: z
    .string()
    .transform((v) => v.replace(/[\s()-]/g, ''))
    .pipe(z.string().regex(PHONE_RE, 'Формат: +998 и 9 цифр')),
  group: z.string().trim().min(1, 'Укажите группу').max(50, 'Максимум 50 символов'),
  monthlyFee: z
    .number({ required_error: 'Укажите сумму', invalid_type_error: 'Укажите сумму' })
    .int()
    .min(1, 'Сумма должна быть больше 0')
    .max(MAX_AMOUNT, 'Слишком большая сумма'),
});

export type StudentFormValues = z.input<typeof studentSchema>;
