import { useEffect, useRef, useState } from 'react';
import { sized } from '../lib/cloudinary';
import { compressImage } from '../lib/image';
import { Icon } from './Icon';

export type PhotoState =
  | { kind: 'none' }
  | { kind: 'existing'; url: string }
  | { kind: 'new'; blob: Blob; previewUrl: string };

interface Props {
  photo: PhotoState;
  onChange: (photo: PhotoState) => void;
}

/** Tirar foto (abre a câmera), escolher da galeria, trocar e remover. A foto é reduzida aqui, antes de qualquer envio. */
export function PhotoField({ photo, onChange }: Props) {
  const camera = useRef<HTMLInputElement>(null);
  const gallery = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Libera a memória da pré-visualização quando a foto muda ou o formulário fecha.
  useEffect(
    () => () => {
      if (photo.kind === 'new') URL.revokeObjectURL(photo.previewUrl);
    },
    [photo],
  );

  async function handleFile(input: HTMLInputElement) {
    const file = input.files?.[0];
    input.value = ''; // permite escolher o mesmo arquivo de novo
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const blob = await compressImage(file);
      onChange({ kind: 'new', blob, previewUrl: URL.createObjectURL(blob) });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não consegui usar essa foto. Tente outra.');
    } finally {
      setBusy(false);
    }
  }

  const src = photo.kind === 'new' ? photo.previewUrl : photo.kind === 'existing' ? sized(photo.url, 800) : null;

  return (
    <div>
      <span className="label">Foto</span>
      {src && <img src={src} alt="Foto da coisa" className="mb-3 h-48 w-full rounded-control bg-sunken object-cover" />}
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-quiet" disabled={busy} onClick={() => camera.current?.click()}>
          <Icon name="camera" className="h-5 w-5" />
          {src ? 'Tirar outra' : 'Tirar foto'}
        </button>
        <button type="button" className="btn-quiet" disabled={busy} onClick={() => gallery.current?.click()}>
          <Icon name="image" className="h-5 w-5" />
          Galeria
        </button>
        {src && (
          <button type="button" className="btn-ghost !px-1" disabled={busy} onClick={() => onChange({ kind: 'none' })}>
            Remover foto
          </button>
        )}
      </div>
      {busy && (
        <p className="mt-2 text-sm text-soft" role="status">
          Preparando a foto…
        </p>
      )}
      {error && (
        <p className="mt-2 text-sm text-danger" role="alert">
          {error}
        </p>
      )}
      {/* "capture" abre direto a câmera traseira; o outro campo abre a galeria. */}
      <input ref={camera} type="file" accept="image/*" capture="environment" className="file-hidden" tabIndex={-1} aria-hidden="true" onChange={(e) => void handleFile(e.currentTarget)} />
      <input ref={gallery} type="file" accept="image/*" className="file-hidden" tabIndex={-1} aria-hidden="true" onChange={(e) => void handleFile(e.currentTarget)} />
    </div>
  );
}
