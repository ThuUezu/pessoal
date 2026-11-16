import { type FormEvent, useEffect, useRef, useState } from 'react';
import { compressImage } from '../lib/image';
import { errorMessage, useItems } from '../lib/items-store';
import type { PhotoRef } from '../lib/types';
import { useUi } from '../lib/ui';
import { uploadPhoto } from '../lib/upload';
import { Icon } from './Icon';
import { Sheet, SheetFooter, SheetScroll } from './Sheet';
import { useToast } from './Toast';

interface Captured {
  blob: Blob;
  previewUrl: string;
}

function QuickSheet({ captured, onClose }: { captured: Captured; onClose: () => void }) {
  const { create } = useItems();
  const { openItem } = useUi();
  const toast = useToast();
  const [name, setName] = useState('');
  const [stage, setStage] = useState<'idle' | 'uploading' | 'saving'>('idle');
  const [error, setError] = useState<string | null>(null);
  const uploaded = useRef<PhotoRef | null>(null);

  async function save(e: FormEvent) {
    e.preventDefault();
    if (stage !== 'idle') return;
    setError(null);
    try {
      if (!uploaded.current) {
        setStage('uploading');
        uploaded.current = await uploadPhoto(captured.blob);
      }
      setStage('saving');
      const item = await create({
        // O nome é opcional de propósito: o importante é não perder o momento. Dá para completar depois.
        name: name.trim() || 'Algo que ela pegou',
        origin: 'PEGOU_E_DEVOLVEU',
        photo: uploaded.current,
      });
      toast({
        message: 'Guardado: ela pegou e devolveu.',
        durationMs: 8000,
        action: { label: 'Completar', onClick: () => openItem(item) },
      });
      onClose();
    } catch (err) {
      setError(errorMessage(err));
      setStage('idle');
    }
  }

  return (
    <Sheet title="Ela pegou e devolveu" onClose={onClose}>
      <form onSubmit={(e) => void save(e)} className="flex min-h-0 flex-1 flex-col">
        <SheetScroll>
          <img src={captured.previewUrl} alt="Foto que você acabou de tirar" className="mb-4 h-56 w-full rounded-control bg-sunken object-cover" />
          <label htmlFor="quick-name" className="label">
            Nome (se souber)
          </label>
          <input id="quick-name" data-autofocus="" className="field" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} autoComplete="off" enterKeyHint="done" placeholder="Ex.: base, tom 40" />
          <p className="mt-2 text-sm text-soft">Se deixar em branco, você completa depois.</p>
        </SheetScroll>
        <SheetFooter>
          {error && (
            <p className="mb-2 text-sm text-danger" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="btn-primary w-full" disabled={stage !== 'idle'}>
            {stage === 'uploading' ? 'Enviando a foto…' : stage === 'saving' ? 'Guardando…' : 'Guardar'}
          </button>
        </SheetFooter>
      </form>
    </Sheet>
  );
}

/** Botão que abre a câmera na hora; depois da foto são só mais 1–2 toques para guardar. */
export function QuickCaptureButton({ variant = 'big' }: { variant?: 'big' | 'compact' }) {
  const input = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [captured, setCaptured] = useState<Captured | null>(null);

  useEffect(
    () => () => {
      if (captured) URL.revokeObjectURL(captured.previewUrl);
    },
    [captured],
  );

  async function onFile(el: HTMLInputElement) {
    const file = el.files?.[0];
    el.value = '';
    if (!file) return;
    setBusy(true);
    try {
      const blob = await compressImage(file);
      setCaptured({ blob, previewUrl: URL.createObjectURL(blob) });
    } catch (e) {
      toast({ message: e instanceof Error ? e.message : 'Não consegui usar essa foto.', tone: 'error' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        disabled={busy}
        onClick={() => input.current?.click()}
        className={variant === 'big' ? 'btn-primary min-h-[64px] w-full text-lg' : 'btn-quiet'}
      >
        <Icon name="camera" className={variant === 'big' ? 'h-6 w-6' : 'h-5 w-5'} />
        {busy ? 'Preparando a foto…' : 'Ela pegou e devolveu'}
      </button>
      <input ref={input} type="file" accept="image/*" capture="environment" className="file-hidden" tabIndex={-1} aria-hidden="true" onChange={(e) => void onFile(e.currentTarget)} />
      {captured && <QuickSheet captured={captured} onClose={() => setCaptured(null)} />}
    </>
  );
}
