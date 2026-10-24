import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  testId?: string;
}

/** Bottom sheet on phones, centered dialog on wider screens. */
export function Sheet({ open, onClose, title, children, testId }: SheetProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    document.addEventListener('keydown', onKeyDown);

    const firstField = panelRef.current?.querySelector<HTMLElement>(
      'input, select, textarea, button:not([data-sheet-close])',
    );
    (firstField ?? panelRef.current)?.focus();

    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 animate-fade-in bg-slate-900/40"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        data-testid={testId}
        className="relative flex max-h-[90dvh] w-full animate-sheet-in flex-col rounded-t-3xl bg-white pb-[env(safe-area-inset-bottom)] shadow-xl outline-none sm:max-w-md sm:rounded-3xl"
      >
        <div className="mx-auto mt-2 h-1.5 w-10 rounded-full bg-slate-300 sm:hidden" aria-hidden />
        <div className="flex items-center justify-between gap-2 px-4 pb-2 pt-3">
          <h2 id={titleId} className="text-lg font-semibold text-slate-900">
            {title}
          </h2>
          <button
            type="button"
            data-sheet-close
            onClick={onClose}
            aria-label="Закрыть"
            className="-mr-2 flex size-11 items-center justify-center rounded-full text-2xl leading-none text-slate-500 hover:bg-slate-100"
          >
            ×
          </button>
        </div>
        <div className="overflow-y-auto px-4 pb-4">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
