import type { ReactNode } from 'react';
import { Button } from './button';

interface EmptyStateProps {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  testId?: string;
}

export function EmptyState({
  title,
  description,
  action,
  testId = 'empty-state',
}: EmptyStateProps) {
  return (
    <div data-testid={testId} className="flex flex-col items-center gap-2 px-6 py-12 text-center">
      <p className="text-base font-semibold text-slate-900">{title}</p>
      {description && <p className="text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      data-testid="error-state"
      role="alert"
      className="flex flex-col items-center gap-3 px-6 py-12 text-center"
    >
      <p className="text-base font-semibold text-slate-900">Не удалось загрузить данные</p>
      <p className="text-sm text-slate-500">{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Повторить
        </Button>
      )}
    </div>
  );
}
