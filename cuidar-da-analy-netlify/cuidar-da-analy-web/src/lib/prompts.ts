import { dayOfYear } from './dates';

/** Perguntas que fazem a pessoa PENSAR nela (em vez de cumprir tarefa). Uma por dia, em rodízio. */
export const PROMPTS = [
  'O que a Analy comentou esta semana?',
  'O que ela elogiou numa loja ou numa rede social?',
  'O que ela pegou, olhou e deixou na prateleira?',
  'Qual foi a última coisa que a fez sorrir sem você esperar?',
  'O que está acabando no nécessaire dela?',
  'Que comida ela pediu de novo nas últimas semanas?',
  'O que ela disse que queria, mas achou que não era hora?',
  'Que detalhe pequeno dela você reparou hoje?',
  'O que ela anda precisando e ainda não pediu?',
];

export function promptForDay(d: Date = new Date()): string {
  return PROMPTS[dayOfYear(d) % PROMPTS.length]!;
}
