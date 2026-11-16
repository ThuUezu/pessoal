import { useState } from 'react';
import { Segmented } from '../components/Segmented';
import type { Me } from '../lib/types';
import { type ThemePref, applyTheme, getThemePref } from '../lib/theme';

const isInstalled = () =>
  window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;

export function Mais({ me, onLogout }: { me: Me; onLogout: () => void }) {
  const [theme, setTheme] = useState<ThemePref>(getThemePref());

  return (
    <div className="pt-6">
      <h1 className="text-[1.9rem] leading-tight">Mais</h1>

      <section className="mt-8 border-b border-line pb-6">
        <h2 className="text-xl">Conta</h2>
        <p className="mt-1 text-soft">{me.email}</p>
        <button type="button" className="btn-quiet mt-3" onClick={onLogout}>
          Sair
        </button>
      </section>

      <section className="mt-6 border-b border-line pb-6">
        <h2 className="mb-3 text-xl">Aparência</h2>
        <Segmented
          legend="Tema"
          hideLegend
          value={theme}
          onChange={(value) => {
            setTheme(value);
            applyTheme(value);
          }}
          options={[
            { value: 'auto', label: 'Automático' },
            { value: 'light', label: 'Claro' },
            { value: 'dark', label: 'Escuro' },
          ]}
        />
      </section>

      <section className="mt-6 border-b border-line pb-6">
        <h2 className="text-xl">Instalar no iPhone</h2>
        {isInstalled() ? (
          <p className="mt-1 text-soft">Você está usando o app instalado. Perfeito.</p>
        ) : (
          <p className="mt-1 text-soft">
            No Safari, toque em Compartilhar e depois em “Adicionar à Tela de Início”. Abra sempre pelo ícone: é assim que os lembretes vão funcionar nas próximas etapas.
          </p>
        )}
      </section>

      <p className="mt-6 text-sm text-soft">Versão 0.1 (Fase 1: login, coisas e fotos).</p>
    </div>
  );
}
