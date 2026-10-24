import type { HTMLAttributes } from 'react';
import { cn } from '@/shared/lib';

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-2xl border border-slate-200 bg-white p-4 shadow-sm', className)}
      {...rest}
    />
  );
}
