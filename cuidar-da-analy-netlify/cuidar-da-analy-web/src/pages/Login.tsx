import { useEffect, useRef, useState } from 'react';
import { Icon } from '../components/Icon';

interface GoogleId {
  initialize(config: Record<string, unknown>): void;
  renderButton(parent: HTMLElement, options: Record<string, unknown>): void;
}
declare global {
  interface Window {
    google?: { accounts: { id: GoogleId } };
  }
}

// O Client ID do Google é público por natureza (aparece no navegador de qualquer site que usa login Google).
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

const LOGIN_ERRORS: Record<string, string> = {
  nao_autorizado: 'Esse e-mail não tem acesso ao app. Entre com a conta Google certa.',
  csrf: 'Não consegui confirmar o login. Feche e abra o app de novo e tente outra vez.',
  token: 'O Google não confirmou o login. Tente de novo.',
};

function loadGoogleScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Não consegui carregar o login do Google. Confira a internet.'));
    document.head.appendChild(script);
  });
}

export function Login() {
  const holder = useRef<HTMLDivElement>(null);
  const [attempt, setAttempt] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);

  // O servidor volta para "/?erro=..." quando recusa o login. Lemos uma vez e limpamos o endereço.
  const [loginError] = useState(() => {
    const code = new URLSearchParams(window.location.search).get('erro');
    if (code) window.history.replaceState(null, '', '/');
    return code ? (LOGIN_ERRORS[code] ?? LOGIN_ERRORS.token!) : null;
  });

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;
    setLoadError(null);
    loadGoogleScript()
      .then(() => {
        if (cancelled || !holder.current) return;
        // Modo "redirect": o Google devolve o login por POST para a nossa API, sem janela pop-up.
        // Pop-ups são pouco confiáveis em apps instalados na tela de início do iPhone.
        window.google!.accounts.id.initialize({
          client_id: CLIENT_ID,
          ux_mode: 'redirect',
          login_uri: `${window.location.origin}/api/auth/google/callback`,
          auto_select: false,
        });
        holder.current.innerHTML = '';
        window.google!.accounts.id.renderButton(holder.current, {
          type: 'standard',
          theme: 'filled_blue',
          size: 'large',
          text: 'signin_with',
          shape: 'pill',
          locale: 'pt-BR',
          width: 300,
        });
      })
      .catch((e: Error) => !cancelled && setLoadError(e.message));
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6 pb-10 pt-safe text-center">
      <span className="mx-auto grid h-20 w-20 place-items-center rounded-[22px] bg-primary-strong text-on-primary">
        <Icon name="heart" className="h-10 w-10 fill-current" />
      </span>
      <h1 className="mt-6 text-[2rem] leading-tight">Cuidar da Analy</h1>
      <p className="mx-auto mt-2 max-w-[17rem] text-soft">Um cantinho para reparar no que ela gosta e lembrar de cuidar.</p>

      <div className="mt-8 flex min-h-[44px] justify-center" ref={holder} />

      {!CLIENT_ID && (
        <p role="alert" className="mt-4 rounded-control bg-warn-soft px-4 py-3 text-sm text-warn-ink">
          Falta configurar VITE_GOOGLE_CLIENT_ID. Veja o README (seção “Login com Google”).
        </p>
      )}
      {loginError && (
        <p role="alert" className="mt-4 rounded-control bg-warn-soft px-4 py-3 text-sm text-warn-ink">
          {loginError}
        </p>
      )}
      {loadError && (
        <div role="alert" className="mt-4">
          <p className="text-sm text-danger">{loadError}</p>
          <button type="button" className="btn-quiet mt-3" onClick={() => setAttempt((n) => n + 1)}>
            <Icon name="refresh" className="h-5 w-5" />
            Tentar de novo
          </button>
        </div>
      )}
      <p className="mt-8 text-sm text-soft">Só a conta autorizada consegue entrar.</p>
    </main>
  );
}
