/** Calcula o tamanho final mantendo a proporção, sem nunca ampliar. */
export function fitWithin(width: number, height: number, max: number): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (longest <= max) return { width, height };
  const scale = max / longest;
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

/**
 * Reduz a foto para no máximo `max` px e converte para JPEG antes de enviar.
 * Usa <img> + canvas (e não createImageBitmap) porque o Safari 16 já aplica a rotação EXIF no <img>.
 */
export async function compressImage(file: File, max = 1280, quality = 0.82): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Não consegui abrir essa foto.'));
      el.src = url;
    });
    const { width, height } = fitWithin(img.naturalWidth, img.naturalHeight, max);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Não consegui preparar a foto.');
    ctx.fillStyle = '#ffffff'; // PNG com transparência viraria preto em JPEG
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Não consegui preparar a foto.'))), 'image/jpeg', quality),
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}
