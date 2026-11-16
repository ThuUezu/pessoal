import { describe, expect, it } from 'vitest';
import { sized, thumb } from './cloudinary';

const url = 'https://res.cloudinary.com/democloud/image/upload/v1700000000/cuidar-da-analy/itens/abc.jpg';

describe('URLs de imagem da Cloudinary', () => {
  it('thumb pede recorte quadrado logo depois de /upload/', () => {
    expect(thumb(url, 168)).toBe(
      'https://res.cloudinary.com/democloud/image/upload/c_fill,g_auto,w_168,h_168,q_auto,f_auto/v1700000000/cuidar-da-analy/itens/abc.jpg',
    );
  });

  it('sized limita a largura sem recortar', () => {
    expect(sized(url, 800)).toContain('/upload/c_limit,w_800,q_auto,f_auto/v1700000000/');
  });

  it('devolve a URL intacta se não for no formato esperado', () => {
    expect(thumb('https://exemplo.com/foto.jpg', 100)).toBe('https://exemplo.com/foto.jpg');
  });
});
