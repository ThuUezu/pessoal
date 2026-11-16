import { useCallback } from 'react';
import { useToast } from '../components/Toast';
import { errorMessage, useItems } from './items-store';
import { CAIXINHA_REMINDER } from './labels';
import type { Item } from './types';

/** "Comprei" e "Desfazer" com o mesmo comportamento em todas as telas. */
export function useBuyActions() {
  const { setBought } = useItems();
  const toast = useToast();

  const undo = useCallback(
    async (item: Item) => {
      try {
        await setBought(item, false);
        toast({ message: 'Voltou para a lista.' });
      } catch (e) {
        toast({ message: errorMessage(e), tone: 'error' });
      }
    },
    [setBought, toast],
  );

  const buy = useCallback(
    async (item: Item) => {
      try {
        await setBought(item, true);
      } catch (e) {
        toast({ message: errorMessage(e), tone: 'error' });
        return;
      }
      const caixinha = item.paidWith === 'CAIXINHA';
      toast({
        message: caixinha ? `Comprado com a caixinha. ${CAIXINHA_REMINDER}` : `${item.name}: marcado como comprado.`,
        tone: caixinha ? 'warn' : 'neutral',
        durationMs: caixinha ? 10_000 : 6_000,
        action: { label: 'Desfazer', onClick: () => void undo(item) },
      });
    },
    [setBought, toast, undo],
  );

  return { buy, undo };
}
