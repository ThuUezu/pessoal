export type Category = 'MAQUIAGEM' | 'COMIDA' | 'ROUPA' | 'OUTRO';
export type Priority = 'BAIXA' | 'MEDIA' | 'ALTA';
export type ItemStatus = 'PENDENTE' | 'COMPRADO';
export type Origin = 'ELA_PEDIU' | 'PEGOU_E_DEVOLVEU' | 'ESTAVA_ACABANDO';
export type PaidWith = 'MEU_DINHEIRO' | 'CAIXINHA';

export interface Item {
  id: string;
  name: string;
  category: Category;
  brand: string | null;
  notes: string | null;
  whereSeen: string | null;
  priority: Priority;
  status: ItemStatus;
  origin: Origin;
  paidWith: PaidWith;
  photoUrl: string | null;
  purchasedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PhotoRef {
  url: string;
  publicId: string;
}

/** O que o app envia ao criar/editar. `photo`: ausente mantém, null remove, objeto troca. */
export interface ItemInput {
  name?: string;
  category?: Category;
  brand?: string | null;
  notes?: string | null;
  whereSeen?: string | null;
  priority?: Priority;
  origin?: Origin;
  paidWith?: PaidWith;
  status?: ItemStatus;
  photo?: PhotoRef | null;
}

export interface Page<T> {
  data: T[];
  pagination: { page: number; pageSize: number; totalItems: number; totalPages: number };
}

export interface Me {
  email: string;
  name: string | null;
}

export interface UploadSignature {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
  uploadUrl: string;
}
