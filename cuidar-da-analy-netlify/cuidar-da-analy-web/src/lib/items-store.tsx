import { type ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ApiError, api } from './api';
import type { Item, ItemInput, ItemStatus, Priority } from './types';

export interface ListState {
  items: Item[];
  status: 'idle' | 'loading' | 'ready' | 'error';
  page: number;
  totalPages: number;
  loadingMore: boolean;
  error: string | null;
}

const EMPTY: ListState = { items: [], status: 'idle', page: 0, totalPages: 1, loadingMore: false, error: null };
const RANK: Record<Priority, number> = { BAIXA: 0, MEDIA: 1, ALTA: 2 };

/** Pendentes: prioridade alta primeiro; na mesma prioridade, o mais novo primeiro (igual ao servidor). */
export const sortPending = (items: Item[]) =>
  [...items].sort((a, b) => RANK[b.priority] - RANK[a.priority] || b.createdAt.localeCompare(a.createdAt));
/** Comprados: compra mais recente primeiro. */
export const sortBought = (items: Item[]) =>
  [...items].sort((a, b) => (b.purchasedAt ?? '').localeCompare(a.purchasedAt ?? ''));

export const errorMessage = (e: unknown) =>
  e instanceof ApiError || e instanceof Error ? e.message : 'Algo deu errado. Tente de novo.';

interface ItemsStore {
  pending: ListState;
  bought: ListState;
  load: (status: ItemStatus, force?: boolean) => Promise<void>;
  loadMore: (status: ItemStatus) => Promise<void>;
  create: (input: ItemInput) => Promise<Item>;
  update: (id: string, input: ItemInput) => Promise<Item>;
  remove: (id: string) => Promise<void>;
  /** Marca/desmarca como comprado na hora (otimista) e desfaz sozinho se o servidor recusar. */
  setBought: (item: Item, bought: boolean) => Promise<Item>;
}

const Ctx = createContext<ItemsStore | null>(null);
export const useItems = () => {
  const store = useContext(Ctx);
  if (!store) throw new Error('useItems fora do ItemsProvider');
  return store;
};

export function ItemsProvider({ children }: { children: ReactNode }) {
  const [lists, setLists] = useState<Record<ItemStatus, ListState>>({ PENDENTE: EMPTY, COMPRADO: EMPTY });
  const listsRef = useRef(lists);
  listsRef.current = lists;
  const lastLoadedAt = useRef(0);

  const patch = useCallback((status: ItemStatus, fn: (s: ListState) => ListState) => {
    setLists((prev) => ({ ...prev, [status]: fn(prev[status]) }));
  }, []);

  const load = useCallback(
    async (status: ItemStatus, force = false) => {
      const current = listsRef.current[status];
      if (!force && (current.status === 'ready' || current.status === 'loading')) return;
      // Recarga silenciosa quando já há dados: a lista não "pisca" para o esqueleto.
      if (current.status !== 'ready') patch(status, (s) => ({ ...s, status: 'loading', error: null }));
      try {
        const res = await api.listItems(status, 1);
        lastLoadedAt.current = Date.now();
        patch(status, () => ({
          items: res.data,
          status: 'ready',
          page: 1,
          totalPages: res.pagination.totalPages,
          loadingMore: false,
          error: null,
        }));
      } catch (e) {
        if (current.status === 'ready') return; // falha numa recarga silenciosa: mantém o que já está na tela
        patch(status, (s) => ({ ...s, status: 'error', error: errorMessage(e) }));
      }
    },
    [patch],
  );

  const loadMore = useCallback(
    async (status: ItemStatus) => {
      const current = listsRef.current[status];
      if (current.loadingMore || current.page >= current.totalPages) return;
      patch(status, (s) => ({ ...s, loadingMore: true }));
      try {
        const res = await api.listItems(status, current.page + 1);
        patch(status, (s) => {
          const known = new Set(s.items.map((i) => i.id));
          return {
            ...s,
            items: [...s.items, ...res.data.filter((i) => !known.has(i.id))],
            page: res.pagination.page,
            totalPages: res.pagination.totalPages,
            loadingMore: false,
          };
        });
      } catch (e) {
        patch(status, (s) => ({ ...s, loadingMore: false, error: errorMessage(e) }));
      }
    },
    [patch],
  );

  /** Tira o item de onde estiver e coloca na lista certa (só se essa lista já foi carregada). */
  const applyItem = useCallback((item: Item) => {
    setLists((prev) => {
      const without = (l: ListState) => ({ ...l, items: l.items.filter((i) => i.id !== item.id) });
      const next = { PENDENTE: without(prev.PENDENTE), COMPRADO: without(prev.COMPRADO) };
      const target = next[item.status];
      if (target.status === 'ready') {
        const items = [...target.items, item];
        next[item.status] = { ...target, items: item.status === 'PENDENTE' ? sortPending(items) : sortBought(items) };
      }
      return next;
    });
  }, []);

  const create = useCallback(
    async (input: ItemInput) => {
      const item = await api.createItem(input);
      applyItem(item);
      return item;
    },
    [applyItem],
  );

  const update = useCallback(
    async (id: string, input: ItemInput) => {
      const item = await api.updateItem(id, input);
      applyItem(item);
      return item;
    },
    [applyItem],
  );

  const remove = useCallback(async (id: string) => {
    await api.deleteItem(id);
    setLists((prev) => ({
      PENDENTE: { ...prev.PENDENTE, items: prev.PENDENTE.items.filter((i) => i.id !== id) },
      COMPRADO: { ...prev.COMPRADO, items: prev.COMPRADO.items.filter((i) => i.id !== id) },
    }));
  }, []);

  const setBought = useCallback(
    async (item: Item, bought: boolean) => {
      const optimistic: Item = bought
        ? { ...item, status: 'COMPRADO', purchasedAt: new Date().toISOString() }
        : { ...item, status: 'PENDENTE', purchasedAt: null };
      applyItem(optimistic);
      try {
        const saved = await api.updateItem(item.id, { status: optimistic.status });
        applyItem(saved);
        return saved;
      } catch (e) {
        applyItem(item); // volta como estava
        throw e;
      }
    },
    [applyItem],
  );

  // Ao voltar para o app (iPhone: abrir pelo ícone de novo), atualiza as listas que já estavam abertas.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== 'visible' || Date.now() - lastLoadedAt.current < 60_000) return;
      for (const status of ['PENDENTE', 'COMPRADO'] as const) {
        if (listsRef.current[status].status === 'ready') void load(status, true);
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [load]);

  const value = useMemo<ItemsStore>(
    () => ({ pending: lists.PENDENTE, bought: lists.COMPRADO, load, loadMore, create, update, remove, setBought }),
    [lists, load, loadMore, create, update, remove, setBought],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
