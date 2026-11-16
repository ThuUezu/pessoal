import type { Item, ItemInput, ItemStatus, Me, Page, UploadSignature } from './types';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

/** Avisado quando o servidor responde 401 (sessão acabou): o app volta para a tela de login. */
let onUnauthorized: (() => void) | null = null;
export const setUnauthorizedHandler = (fn: (() => void) | null) => {
  onUnauthorized = fn;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 502/503/504 = servidor do Render ainda acordando (plano gratuito dorme) ou o proxy do Netlify estourou os 26 s.
const WAKING_UP = new Set([502, 503, 504]);
const WAKING_UP_MESSAGE = 'O servidor está acordando. Tente de novo em alguns segundos.';

function fallbackMessage(status: number): string {
  if (WAKING_UP.has(status)) return WAKING_UP_MESSAGE;
  if (status === 429) return 'Muitas tentativas. Espere um pouco e tente de novo.';
  return 'Algo deu errado. Tente de novo.';
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  // Só leituras (GET) repetem sozinhas; repetir um POST poderia duplicar uma coisa.
  const attempts = method === 'GET' ? 3 : 1;

  for (let attempt = 1; ; attempt++) {
    let res: Response;
    try {
      res = await fetch(`/api${path}`, {
        method,
        credentials: 'same-origin',
        // Content-Type só quando há corpo: o servidor recusa JSON "vazio".
        headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    } catch {
      if (attempt < attempts) {
        await sleep(2000 * attempt);
        continue;
      }
      throw new ApiError(0, 'NETWORK', 'Sem conexão com o servidor. Confira a internet e tente de novo.');
    }

    if (WAKING_UP.has(res.status) && attempt < attempts) {
      await sleep(2000 * attempt);
      continue;
    }
    if (res.status === 204) return undefined as T;

    let data: unknown = null;
    try {
      data = await res.json();
    } catch {
      /* corpo vazio ou HTML de erro do proxy */
    }
    if (res.ok) return data as T;

    const err = (data as { error?: { code?: string; message?: string; details?: unknown } } | null)?.error;
    if (res.status === 401) onUnauthorized?.();
    throw new ApiError(res.status, err?.code ?? 'ERROR', err?.message ?? fallbackMessage(res.status), err?.details);
  }
}

export const api = {
  me: () => request<Me>('GET', '/me'),
  logout: () => request<void>('POST', '/auth/logout'),
  listItems: (status: ItemStatus, page = 1, pageSize = 100) =>
    request<Page<Item>>('GET', `/items?status=${status}&page=${page}&pageSize=${pageSize}`),
  createItem: (input: ItemInput) => request<Item>('POST', '/items', input),
  updateItem: (id: string, input: ItemInput) => request<Item>('PATCH', `/items/${id}`, input),
  deleteItem: (id: string) => request<void>('DELETE', `/items/${id}`),
  uploadSignature: () => request<UploadSignature>('POST', '/uploads/signatures'),
};
