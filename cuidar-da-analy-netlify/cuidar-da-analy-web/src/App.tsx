import { useCallback, useEffect, useMemo, useState } from 'react';
import { BottomNav } from './components/BottomNav';
import { Icon } from './components/Icon';
import { ItemForm } from './components/ItemForm';
import { ToastProvider } from './components/Toast';
import { ApiError, api, setUnauthorizedHandler } from './lib/api';
import { ItemsProvider, errorMessage } from './lib/items-store';
import type { Item, Me } from './lib/types';
import { type Tab, type Ui, UiContext } from './lib/ui';
import { Coisas } from './pages/Coisas';
import { Hoje } from './pages/Hoje';
import { Login } from './pages/Login';
import { Mais } from './pages/Mais';
import { Soon } from './pages/Soon';

type Auth =
  | { status: 'loading' }
  | { status: 'anon' }
  | { status: 'unreachable'; message: string }
  | { status: 'authed'; me: Me };

function Opening({ slow }: { slow: boolean }) {
  return (
    <div className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <span className="mx-auto grid h-16 w-16 animate-pulse place-items-center rounded-[18px] bg-primary-strong text-on-primary">
          <Icon name="heart" className="h-8 w-8 fill-current" />
        </span>
        <p className="mt-4 text-soft" role="status">
          {slow ? 'O servidor está acordando, só um instante…' : 'Abrindo…'}
        </p>
      </div>
    </div>
  );
}

function Shell({ me, onLogout }: { me: Me; onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>('hoje');
  const [editor, setEditor] = useState<{ item: Item | null } | null>(null);

  const ui = useMemo<Ui>(
    () => ({ openItem: (item) => setEditor({ item }), openNew: () => setEditor({ item: null }), goTo: setTab }),
    [],
  );

  useEffect(() => {
    window.scrollTo(0, 0); // efeito não pode devolver o resultado: o React o trataria como função de limpeza
  }, [tab]);

  return (
    <UiContext.Provider value={ui}>
      <main className="pb-nav mx-auto w-full max-w-xl px-4 pt-safe">
        {tab === 'hoje' && <Hoje />}
        {tab === 'coisas' && <Coisas />}
        {tab === 'postagens' && (
          <Soon title="Postagens" icon="image">
            Aqui vai ficar o registro das fotos e stories com ela, com a meta da semana. Chega na próxima etapa.
          </Soon>
        )}
        {tab === 'cartas' && (
          <Soon title="Cartas" icon="mail">
            Aqui vão ficar as cartas, os desenhos e o banco de ideias. Chega na próxima etapa.
          </Soon>
        )}
        {tab === 'mais' && <Mais me={me} onLogout={onLogout} />}
      </main>
      <BottomNav active={tab} onChange={setTab} />
      {editor && <ItemForm key={editor.item?.id ?? 'nova'} item={editor.item} onClose={() => setEditor(null)} />}
    </UiContext.Provider>
  );
}

export function App() {
  const [auth, setAuth] = useState<Auth>({ status: 'loading' });
  const [slow, setSlow] = useState(false);

  const check = useCallback(async () => {
    setAuth({ status: 'loading' });
    try {
      setAuth({ status: 'authed', me: await api.me() });
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) setAuth({ status: 'anon' });
      else setAuth({ status: 'unreachable', message: errorMessage(e) });
    }
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => setAuth({ status: 'anon' }));
    void check();
    return () => setUnauthorizedHandler(null);
  }, [check]);

  // Se abrir demora (servidor do plano gratuito acordando), explica em vez de deixar a tela parada.
  useEffect(() => {
    if (auth.status !== 'loading') {
      setSlow(false);
      return;
    }
    const t = window.setTimeout(() => setSlow(true), 4000);
    return () => window.clearTimeout(t);
  }, [auth.status]);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      setAuth({ status: 'anon' });
    }
  }, []);

  return (
    <ToastProvider>
      {auth.status === 'loading' && <Opening slow={slow} />}
      {auth.status === 'anon' && <Login />}
      {auth.status === 'unreachable' && (
        <div className="grid min-h-screen place-items-center px-6 text-center">
          <div role="alert">
            <p className="font-display text-xl">Não consegui abrir agora.</p>
            <p className="mt-2 text-soft">{auth.message}</p>
            <button type="button" className="btn-primary mt-5" onClick={() => void check()}>
              <Icon name="refresh" className="h-5 w-5" />
              Tentar de novo
            </button>
          </div>
        </div>
      )}
      {auth.status === 'authed' && (
        <ItemsProvider>
          <Shell me={auth.me} onLogout={() => void logout()} />
        </ItemsProvider>
      )}
    </ToastProvider>
  );
}
