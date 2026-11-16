import { api } from './api';
import type { PhotoRef } from './types';

/** Envia a foto direto do celular para a Cloudinary, com a assinatura gerada pelo nosso servidor. */
export async function uploadPhoto(blob: Blob): Promise<PhotoRef> {
  const sig = await api.uploadSignature();
  const form = new FormData();
  form.append('file', blob, 'foto.jpg');
  form.append('api_key', sig.apiKey);
  form.append('timestamp', String(sig.timestamp));
  form.append('folder', sig.folder);
  form.append('signature', sig.signature);

  let res: Response;
  try {
    res = await fetch(sig.uploadUrl, { method: 'POST', body: form });
  } catch {
    throw new Error('Não consegui enviar a foto. Confira a internet e tente de novo.');
  }
  if (!res.ok) throw new Error('A foto não foi aceita pelo serviço de imagens. Tente outra.');
  const data = (await res.json()) as { secure_url?: string; public_id?: string };
  if (!data.secure_url || !data.public_id) throw new Error('Resposta inesperada ao enviar a foto.');
  return { url: data.secure_url, publicId: data.public_id };
}
