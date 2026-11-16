import { describe, expect, it } from 'vitest';
import { sortBought, sortPending } from './items-store';
import type { Item } from './types';

const base: Item = {
  id: 'x', name: 'x', category: 'OUTRO', brand: null, notes: null, whereSeen: null, priority: 'MEDIA', status: 'PENDENTE',
  origin: 'ELA_PEDIU', paidWith: 'MEU_DINHEIRO', photoUrl: null, purchasedAt: null,
  createdAt: '2026-11-10T10:00:00.000Z', updatedAt: '2026-11-10T10:00:00.000Z',
};
const item = (over: Partial<Item>): Item => ({ ...base, ...over });

describe('ordenação das listas', () => {
  it('pendentes: prioridade alta primeiro e, empatando, o mais novo primeiro', () => {
    const sorted = sortPending([
      item({ id: 'baixa', priority: 'BAIXA' }),
      item({ id: 'alta-velha', priority: 'ALTA', createdAt: '2026-11-01T00:00:00.000Z' }),
      item({ id: 'alta-nova', priority: 'ALTA', createdAt: '2026-11-12T00:00:00.000Z' }),
      item({ id: 'media', priority: 'MEDIA' }),
    ]);

    expect(sorted.map((i) => i.id)).toEqual(['alta-nova', 'alta-velha', 'media', 'baixa']);
  });

  it('comprados: compra mais recente primeiro', () => {
    const sorted = sortBought([
      item({ id: 'a', status: 'COMPRADO', purchasedAt: '2026-11-01T00:00:00.000Z' }),
      item({ id: 'b', status: 'COMPRADO', purchasedAt: '2026-11-13T00:00:00.000Z' }),
    ]);

    expect(sorted.map((i) => i.id)).toEqual(['b', 'a']);
  });

  it('não altera a lista original', () => {
    const original = [item({ id: 'a', priority: 'BAIXA' }), item({ id: 'b', priority: 'ALTA' })];
    sortPending(original);

    expect(original.map((i) => i.id)).toEqual(['a', 'b']);
  });
});
