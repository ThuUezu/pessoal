import { Icon } from './Icon';

export function Skeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="animate-pulse" role="status" aria-label="Carregando">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3 border-b border-line py-3 last:border-b-0">
          <div className="h-14 w-14 rounded-thumb bg-sunken" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/3 rounded bg-sunken" />
            <div className="h-3 w-1/3 rounded bg-sunken" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ErrorBox({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="rounded-control bg-sunken px-4 py-4">
      <p className="text-sm">{message}</p>
      <button type="button" className="btn-quiet mt-3 bg-surface" onClick={onRetry}>
        <Icon name="refresh" className="h-5 w-5" />
        Tentar de novo
      </button>
    </div>
  );
}

export function Empty({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="px-2 py-8 text-center">
      <p className="font-display text-lg">{title}</p>
      {children && <p className="mx-auto mt-1 max-w-xs text-sm text-soft">{children}</p>}
    </div>
  );
}
