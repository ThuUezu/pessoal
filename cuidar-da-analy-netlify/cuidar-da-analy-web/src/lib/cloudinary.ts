/** Pede à Cloudinary uma versão menor da foto (recorte quadrado, formato e qualidade automáticos). */
export function thumb(url: string, size: number): string {
  const marker = '/upload/';
  const i = url.indexOf(marker);
  if (i === -1) return url;
  return `${url.slice(0, i + marker.length)}c_fill,g_auto,w_${size},h_${size},q_auto,f_auto/${url.slice(i + marker.length)}`;
}

/** Versão grande (para o formulário), limitada em largura. */
export function sized(url: string, width: number): string {
  const marker = '/upload/';
  const i = url.indexOf(marker);
  if (i === -1) return url;
  return `${url.slice(0, i + marker.length)}c_limit,w_${width},q_auto,f_auto/${url.slice(i + marker.length)}`;
}
