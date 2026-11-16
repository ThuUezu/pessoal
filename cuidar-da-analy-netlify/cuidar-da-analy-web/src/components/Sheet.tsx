import { type ReactNode, useEffect, useId, useRef } from 'react';
import { Icon } from './Icon';

interface SheetProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Painel que sobe da base da tela. Diálogo acessível: foco preso, Esc fecha, devolve o foco ao fechar. */
export function Sheet({ title, onClose, children }: SheetProps) {
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    (panel.current?.querySelector<HTMLElement>('[data-autofocus]') ?? panel.current)?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeRef.current();
        return;
      }
      if (e.key !== 'Tab' || !panel.current) return;
      const items = [...panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      opener?.focus?.();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 animate-fade bg-ink/45" onClick={() => closeRef.current()} aria-hidden="true" />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="absolute inset-x-0 bottom-0 mx-auto flex max-h-[92%] max-w-xl animate-sheet-up flex-col rounded-t-sheet bg-bg outline-none"
      >
        <div className="flex items-center justify-between gap-3 px-4 pb-2 pt-4">
          <h2 id={titleId} className="text-xl">
            {title}
          </h2>
          <button type="button" className="btn-quiet !px-0 w-11" onClick={() => closeRef.current()} aria-label="Fechar">
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function SheetScroll({ children }: { children: ReactNode }) {
  return <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4">{children}</div>;
}

export function SheetFooter({ children }: { children: ReactNode }) {
  return (
    <div className="border-t border-line bg-bg px-4 pb-[calc(env(safe-area-inset-bottom,0px)+12px)] pt-3">{children}</div>
  );
}
