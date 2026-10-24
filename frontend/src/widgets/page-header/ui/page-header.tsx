import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  backTo?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, backTo, actions }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="mx-auto flex min-h-14 max-w-xl items-center gap-2 px-4">
        {backTo && (
          <Link
            to={backTo}
            aria-label="Назад"
            className="-ml-2 flex size-11 items-center justify-center rounded-full text-2xl text-slate-700 hover:bg-slate-100"
          >
            ‹
          </Link>
        )}
        <h1 className="min-w-0 flex-1 truncate text-lg font-semibold text-slate-900">{title}</h1>
        {actions}
      </div>
    </header>
  );
}
