import { type ReactNode, createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Icon } from './Icon';

interface ToastOptions {
  message: string;
  tone?: 'neutral' | 'warn' | 'error';
  action?: { label: string; onClick: () => void };
  durationMs?: number;
}

const ToastContext = createContext<(options: ToastOptions) => void>(() => {});
export const useToast = () => useContext(ToastContext);

const TONE = {
  neutral: 'bg-ink text-bg',
  warn: 'bg-warn-soft text-warn-ink border border-warn/40',
  error: 'bg-danger-solid text-on-primary',
} as const;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastOptions | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const show = useCallback((options: ToastOptions) => {
    window.clearTimeout(timer.current);
    setToast(options);
    timer.current = window.setTimeout(() => setToast(null), options.durationMs ?? 6000);
  }, []);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      {/* Fica atrás dos painéis (z-40): um aviso antigo nunca cobre um formulário aberto.
          A região fica sempre no DOM para o leitor de tela anunciar o conteúdo que aparece. */}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom,0px)+140px)] z-[35] flex justify-center px-4"
      >
        {toast && (
          <div
            className={`pointer-events-auto flex max-w-md animate-fade items-center gap-3 rounded-control px-4 py-3 text-sm shadow-lg ${TONE[toast.tone ?? 'neutral']}`}
          >
            {toast.tone === 'warn' && <Icon name="alert" className="h-5 w-5 shrink-0" />}
            <span className="min-w-0 flex-1">{toast.message}</span>
            {toast.action && (
              <button
                type="button"
                className="min-h-[44px] shrink-0 px-2 font-semibold underline underline-offset-2"
                onClick={() => {
                  toast.action?.onClick();
                  setToast(null);
                }}
              >
                {toast.action.label}
              </button>
            )}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}
