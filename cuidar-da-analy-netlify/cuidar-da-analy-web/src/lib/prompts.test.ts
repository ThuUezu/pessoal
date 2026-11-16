import { describe, expect, it } from 'vitest';
import { dayOfYear } from './dates';
import { PROMPTS, promptForDay } from './prompts';

describe('pergunta do dia', () => {
  it('conta o dia do ano no fuso de São Paulo', () => {
    expect(dayOfYear(new Date('2026-01-01T12:00:00-03:00'))).toBe(1);
    expect(dayOfYear(new Date('2026-11-14T12:00:00-03:00'))).toBe(318);
  });

  it('às 23h30 em São Paulo ainda é o mesmo dia, mesmo já sendo o dia seguinte em UTC', () => {
    expect(dayOfYear(new Date('2026-11-14T23:30:00-03:00'))).toBe(318);
  });

  it('muda a pergunta de um dia para o outro', () => {
    const a = promptForDay(new Date('2026-11-14T12:00:00-03:00'));
    const b = promptForDay(new Date('2026-11-15T12:00:00-03:00'));
    expect(a).not.toBe(b);
  });

  it('todas as perguntas são curtas e terminam em interrogação', () => {
    for (const p of PROMPTS) {
      expect(p.length).toBeLessThan(70);
      expect(p.endsWith('?')).toBe(true);
    }
  });
});
