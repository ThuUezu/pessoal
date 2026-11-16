import type { Category, Origin, PaidWith, Priority } from './types';

export const CATEGORY_LABEL: Record<Category, string> = {
  MAQUIAGEM: 'Maquiagem',
  COMIDA: 'Comida',
  ROUPA: 'Roupa',
  OUTRO: 'Outro',
};
export const PRIORITY_LABEL: Record<Priority, string> = { BAIXA: 'Baixa', MEDIA: 'Média', ALTA: 'Alta' };
export const ORIGIN_LABEL: Record<Origin, string> = {
  ELA_PEDIU: 'Ela pediu',
  PEGOU_E_DEVOLVEU: 'Ela pegou e devolveu na loja',
  ESTAVA_ACABANDO: 'Vi que estava acabando',
};
export const PAID_WITH_LABEL: Record<PaidWith, string> = { MEU_DINHEIRO: 'Meu dinheiro', CAIXINHA: 'Caixinha' };

export const CATEGORIES = Object.keys(CATEGORY_LABEL) as Category[];
export const PRIORITIES = Object.keys(PRIORITY_LABEL) as Priority[];
export const ORIGINS = Object.keys(ORIGIN_LABEL) as Origin[];
export const PAID_WITHS = Object.keys(PAID_WITH_LABEL) as PaidWith[];

export const CAIXINHA_REMINDER = 'Lembrete: o combinado é não usar a caixinha sem conversar antes.';
