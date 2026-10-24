import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { formatMoney, today } from '@/shared/lib';
import { Button, Field, Input, MoneyInput, Sheet, useToast } from '@/shared/ui';
import { paymentSchema, type PaymentFormValues } from '../model/schema';
import { useCreatePayment } from '../model/use-create-payment';
import { StudentPicker, type PickedStudent } from './student-picker';

export interface PaymentPreset {
  student: PickedStudent;
  /** Pre-filled amount. */
  amount?: number;
  /** Text under the amount field, e.g. the remaining debt. */
  amountHint?: string;
}

interface AddPaymentSheetProps {
  open: boolean;
  onClose: () => void;
  preset?: PaymentPreset;
}

export function AddPaymentSheet({ open, onClose, preset }: AddPaymentSheetProps) {
  return (
    <Sheet open={open} onClose={onClose} title="Новая оплата" testId="payment-sheet">
      {/* Remount per preset so default values are fresh every time the sheet opens. */}
      <PaymentForm key={preset?.student.id ?? 'new'} preset={preset} onDone={onClose} />
    </Sheet>
  );
}

function PaymentForm({ preset, onDone }: { preset?: PaymentPreset; onDone: () => void }) {
  const toast = useToast();
  const createPayment = useCreatePayment();
  const [student, setStudent] = useState<PickedStudent | null>(preset?.student ?? null);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { studentId: preset?.student.id, amount: preset?.amount, paidAt: today() },
  });

  const onSubmit = (values: PaymentFormValues) =>
    createPayment.mutate(values, {
      onSuccess: () => {
        toast.success(`Оплата ${formatMoney(values.amount)} — ${student?.name ?? ''}`);
        onDone();
      },
      onError: (error) => toast.error(error.message),
    });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4"
      data-testid="payment-form"
    >
      <Field label="Ученик" error={errors.studentId?.message}>
        {(p) => (
          <StudentPicker
            id={p.id}
            invalid={p['aria-invalid']}
            value={student}
            onChange={(s) => {
              setStudent(s);
              setValue('studentId', s?.id as number, { shouldValidate: !!s });
            }}
          />
        )}
      </Field>
      <Field label="Сумма" error={errors.amount?.message} hint={preset?.amountHint}>
        {(p) => (
          <Controller
            control={control}
            name="amount"
            render={({ field }) => (
              <MoneyInput
                {...p}
                ref={field.ref}
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                data-testid="payment-amount"
              />
            )}
          />
        )}
      </Field>
      <Field label="Дата оплаты" error={errors.paidAt?.message}>
        {(p) => (
          <Input
            {...p}
            type="date"
            max={today()}
            {...register('paidAt')}
            data-testid="payment-date"
          />
        )}
      </Field>
      <Button type="submit" block loading={createPayment.isPending} data-testid="payment-submit">
        Принять оплату
      </Button>
    </form>
  );
}
