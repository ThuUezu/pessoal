import { createContext, useContext } from 'react';
import type { Item } from './types';

export type Tab = 'hoje' | 'coisas' | 'postagens' | 'cartas' | 'mais';

/** Ações de tela que qualquer página pode pedir (abrir o formulário, trocar de aba). */
export interface Ui {
  openItem: (item: Item) => void;
  openNew: () => void;
  goTo: (tab: Tab) => void;
}

export const UiContext = createContext<Ui | null>(null);
export const useUi = () => {
  const ui = useContext(UiContext);
  if (!ui) throw new Error('useUi fora do UiContext');
  return ui;
};
