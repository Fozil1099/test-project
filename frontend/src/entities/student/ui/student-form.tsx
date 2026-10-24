import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Button, Field, Input, MoneyInput } from '@/shared/ui';
import { studentSchema, type StudentFormValues } from '../model/schema';
import type { StudentInput } from '../model/types';

interface StudentFormProps {
  defaultValues?: Partial<StudentInput>;
  submitLabel: string;
  submitting?: boolean;
  onSubmit: (values: StudentInput) => void;
}

export function StudentForm({
  defaultValues,
  submitLabel,
  submitting,
  onSubmit,
}: StudentFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<StudentFormValues, unknown, StudentInput>({
    resolver: zodResolver(studentSchema),
    defaultValues: { name: '', phone: '+998', group: '', ...defaultValues },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4"
      data-testid="student-form"
    >
      <Field label="Имя" error={errors.name?.message}>
        {(p) => (
          <Input {...p} {...register('name')} autoComplete="name" data-testid="student-name" />
        )}
      </Field>
      <Field label="Телефон" error={errors.phone?.message}>
        {(p) => (
          <Input
            {...p}
            {...register('phone')}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+998901234567"
            data-testid="student-phone"
          />
        )}
      </Field>
      <Field label="Группа" error={errors.group?.message}>
        {(p) => (
          <Input
            {...p}
            {...register('group')}
            placeholder="Например, English A1"
            data-testid="student-group"
          />
        )}
      </Field>
      <Field label="Сумма в месяц" error={errors.monthlyFee?.message}>
        {(p) => (
          <Controller
            control={control}
            name="monthlyFee"
            render={({ field }) => (
              <MoneyInput
                {...p}
                ref={field.ref}
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                data-testid="student-fee"
              />
            )}
          />
        )}
      </Field>
      <Button type="submit" block loading={submitting} data-testid="student-submit">
        {submitLabel}
      </Button>
    </form>
  );
}
