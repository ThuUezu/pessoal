import { useEffect } from 'react';
import { Icon } from '../components/Icon';
import { ItemRow } from '../components/ItemRow';
import { QuickCaptureButton } from '../components/QuickCapture';
import { Empty, ErrorBox, Skeleton } from '../components/States';
import { formatLongDay } from '../lib/dates';
import { useItems } from '../lib/items-store';
import { promptForDay } from '../lib/prompts';
import { useUi } from '../lib/ui';
import { useBuyActions } from '../lib/use-buy';

const SHOWN = 5;

export function Hoje() {
  const { pending, load } = useItems();
  const { openItem, openNew, goTo } = useUi();
  const { buy, undo } = useBuyActions();

  useEffect(() => {
    void load('PENDENTE');
  }, [load]);

  const shown = pending.items.slice(0, SHOWN);
  const hidden = pending.items.length - shown.length;

  return (
    <div>
      <header className="pt-6">
        <p className="text-sm text-soft first-letter:uppercase">{formatLongDay(new Date())}</p>
        <h1 className="mt-1 text-[1.9rem] leading-tight">{promptForDay()}</h1>
        <p className="mt-2 text-soft">Pense um minuto e anote enquanto lembra.</p>
      </header>

      <div className="mt-5 space-y-3">
        <QuickCaptureButton />
        <button type="button" className="btn-quiet w-full" onClick={openNew}>
          <Icon name="plus" className="h-5 w-5" />
          Anotar sem foto
        </button>
      </div>

      <section className="mt-9" aria-labelledby="para-comprar">
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="para-comprar" className="text-xl">
            Para comprar
          </h2>
          {pending.status === 'ready' && pending.items.length > 0 && (
            <span className="text-sm text-soft">
              {pending.items.length}
              {pending.page < pending.totalPages ? '+' : ''} esperando
            </span>
          )}
        </div>

        <div className="mt-2">
          {pending.status === 'loading' || pending.status === 'idle' ? (
            <Skeleton />
          ) : pending.status === 'error' ? (
            <ErrorBox message={pending.error ?? 'Não consegui carregar.'} onRetry={() => void load('PENDENTE', true)} />
          ) : shown.length === 0 ? (
            <Empty title="Nada esperando por você agora.">Quando ela comentar algo, toque em “Anotar” ou tire uma foto.</Empty>
          ) : (
            <>
              <ul>
                {shown.map((item) => (
                  <ItemRow key={item.id} item={item} onOpen={openItem} onBuy={(i) => void buy(i)} onUndo={(i) => void undo(i)} />
                ))}
              </ul>
              {(hidden > 0 || pending.page < pending.totalPages) && (
                <button type="button" className="btn-ghost mt-1 w-full" onClick={() => goTo('coisas')}>
                  Ver todas as coisas
                </button>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
