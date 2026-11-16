import { useEffect, useState } from 'react';
import { Icon } from '../components/Icon';
import { ItemRow } from '../components/ItemRow';
import { QuickCaptureButton } from '../components/QuickCapture';
import { Segmented } from '../components/Segmented';
import { Empty, ErrorBox, Skeleton } from '../components/States';
import { useItems } from '../lib/items-store';
import { CATEGORIES, CATEGORY_LABEL } from '../lib/labels';
import type { Category, ItemStatus } from '../lib/types';
import { useUi } from '../lib/ui';
import { useBuyActions } from '../lib/use-buy';

export function Coisas() {
  const { pending, bought, load, loadMore } = useItems();
  const { openItem, openNew } = useUi();
  const { buy, undo } = useBuyActions();
  const [tab, setTab] = useState<ItemStatus>('PENDENTE');
  const [category, setCategory] = useState<Category | 'TODAS'>('TODAS');

  useEffect(() => {
    void load(tab);
  }, [tab, load]);

  const list = tab === 'PENDENTE' ? pending : bought;
  const visible = category === 'TODAS' ? list.items : list.items.filter((i) => i.category === category);
  const hasMore = list.page < list.totalPages;

  return (
    <div>
      <header className="pt-6">
        <h1 className="text-[1.9rem] leading-tight">Coisas que ela gosta</h1>
      </header>

      <div className="mt-4 space-y-3">
        <Segmented
          legend="Mostrar"
          hideLegend
          columns={2}
          value={tab}
          onChange={setTab}
          options={[
            { value: 'PENDENTE', label: `Pendentes${pending.status === 'ready' ? ` (${pending.items.length}${pending.page < pending.totalPages ? '+' : ''})` : ''}` },
            { value: 'COMPRADO', label: 'Comprados' },
          ]}
        />
        <div className="flex items-center gap-3">
          <label htmlFor="cat-filter" className="shrink-0 text-sm text-soft">
            Categoria
          </label>
          <select id="cat-filter" className="field" value={category} onChange={(e) => setCategory(e.target.value as Category | 'TODAS')}>
            <option value="TODAS">Todas</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABEL[c]}
              </option>
            ))}
          </select>
        </div>
        <QuickCaptureButton variant="compact" />
      </div>

      <div className="mt-3 pb-24">
        {list.status === 'loading' || list.status === 'idle' ? (
          <Skeleton rows={4} />
        ) : list.status === 'error' ? (
          <ErrorBox message={list.error ?? 'Não consegui carregar.'} onRetry={() => void load(tab, true)} />
        ) : visible.length === 0 ? (
          category !== 'TODAS' && list.items.length > 0 ? (
            <Empty title="Nada nessa categoria." />
          ) : tab === 'PENDENTE' ? (
            <Empty title="Nada esperando por você agora.">Quando ela comentar algo, toque em “Nova coisa”.</Empty>
          ) : (
            <Empty title="Ainda não há compras registradas.">Quando você marcar algo como comprado, aparece aqui.</Empty>
          )
        ) : (
          <>
            <ul>
              {visible.map((item) => (
                <ItemRow key={item.id} item={item} onOpen={openItem} onBuy={(i) => void buy(i)} onUndo={(i) => void undo(i)} />
              ))}
            </ul>
            {hasMore && (
              <button type="button" className="btn-quiet mt-3 w-full" disabled={list.loadingMore} onClick={() => void loadMore(tab)}>
                {list.loadingMore ? 'Carregando…' : 'Ver mais'}
              </button>
            )}
          </>
        )}
      </div>

      <button
        type="button"
        onClick={openNew}
        className="btn-primary fixed bottom-[calc(env(safe-area-inset-bottom,0px)+76px)] right-4 z-20 min-h-[52px] px-5 shadow-lg"
      >
        <Icon name="plus" className="h-5 w-5" />
        Nova coisa
      </button>
    </div>
  );
}
