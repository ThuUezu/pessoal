const TZ = 'America/Sao_Paulo';

const longDay = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: TZ });
const shortDay = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short', timeZone: TZ });
const dayKey = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: TZ });

/** "sexta-feira, 14 de novembro" */
export const formatLongDay = (d: Date | string) => longDay.format(new Date(d));
/** "14 de nov." */
export const formatShortDay = (d: Date | string) => shortDay.format(new Date(d));

/** Dia do ano (1–366) no fuso de São Paulo: usado para variar a pergunta do dia sem repetir seguido. */
export function dayOfYear(d: Date = new Date()): number {
  const [y, m, day] = dayKey.format(d).split('-').map(Number) as [number, number, number];
  return Math.floor((Date.UTC(y, m - 1, day) - Date.UTC(y, 0, 0)) / 86_400_000);
}
