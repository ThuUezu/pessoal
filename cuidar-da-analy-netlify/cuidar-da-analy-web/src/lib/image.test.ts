import { describe, expect, it } from 'vitest';
import { fitWithin } from './image';

describe('fitWithin', () => {
  it('reduz foto horizontal grande para 1280 no lado maior, mantendo a proporção', () => {
    expect(fitWithin(4032, 3024, 1280)).toEqual({ width: 1280, height: 960 });
  });

  it('reduz foto vertical pelo lado maior (altura)', () => {
    expect(fitWithin(3024, 4032, 1280)).toEqual({ width: 960, height: 1280 });
  });

  it('nunca amplia foto que já é pequena', () => {
    expect(fitWithin(800, 600, 1280)).toEqual({ width: 800, height: 600 });
  });

  it('não mexe numa foto exatamente no limite', () => {
    expect(fitWithin(1280, 720, 1280)).toEqual({ width: 1280, height: 720 });
  });
});
