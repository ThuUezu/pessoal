import { type FormEvent, useRef, useState } from 'react';
import { errorMessage, useItems } from '../lib/items-store';
import { formatShortDay } from '../lib/dates';
import {
  CAIXINHA_REMINDER,
  CATEGORIES,
  CATEGORY_LABEL,
  ORIGINS,
  ORIGIN_LABEL,
  PAID_WITHS,
  PAID_WITH_LABEL,
  PRIORITIES,
  PRIORITY_LABEL,
} from '../lib/labels';
import type { Category, Item, ItemInput, Origin, PaidWith, PhotoRef, Priority } from '../lib/types';
import { uploadPhoto } from '../lib/upload';
import { Icon } from './Icon';
import { PhotoField, type PhotoState } from './PhotoField';
import { Segmented } from './Segmented';
import { Sheet, SheetFooter, SheetScroll } from './Sheet';
import { useToast } from './Toast';

interface Props {
  /** null = nova coisa. */
  item: Item | null;
  onClose: () => void;
}

const options = <T extends string>(values: T[], labels: Record<T, string>) =>
  values.map((value) => ({ value, label: labels[value] }));

export function ItemForm({ item, onClose }: Props) {
  const { create, update, remove } = useItems();
  const toast = useToast();

  const [name, setName] = useState(item?.name ?? '');
  const [category, setCategory] = useState<Category>(item?.category ?? 'OUTRO');
  const [brand, setBrand] = useState(item?.brand ?? '');
  const [whereSeen, setWhereSeen] = useState(item?.whereSeen ?? '');
  const [notes, setNotes] = useState(item?.notes ?? '');
  const [priority, setPriority] = useState<Priority>(item?.priority ?? 'MEDIA');
  const [origin, setOrigin] = useState<Origin>(item?.origin ?? 'ELA_PEDIU');
  const [paidWith, setPaidWith] = useState<PaidWith>(item?.paidWith ?? 'MEU_DINHEIRO');
  const [photo, setPhoto] = useState<PhotoState>(item?.photoUrl ? { kind: 'existing', url: item.photoUrl } : { kind: 'none' });

  const [stage, setStage] = useState<'idle' | 'uploading' | 'saving'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const nameInput = useRef<HTMLInputElement>(null);
  // Se salvar falhar depois do envio da foto, tentar de novo não reenvia a mesma foto.
  const uploaded = useRef<{ blob: Blob; ref: PhotoRef } | null>(null);

  const busy = stage !== 'idle';

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError('Dê um nome para a coisa.');
      nameInput.current?.focus();
      return;
    }
    setNameError(null);
    setError(null);

    try {
      let photoChange: PhotoRef | null | undefined; // undefined = não mexe na foto
      if (photo.kind === 'new') {
        if (uploaded.current?.blob !== photo.blob) {
          setStage('uploading');
          uploaded.current = { blob: photo.blob, ref: await uploadPhoto(photo.blob) };
        }
        photoChange = uploaded.current.ref;
      } else if (photo.kind === 'none' && item?.photoUrl) {
        photoChange = null;
      }

      setStage('saving');
      const input: ItemInput = {
        name: trimmed,
        category,
        brand,
        whereSeen,
        notes,
        priority,
        origin,
        paidWith,
        ...(photoChange !== undefined ? { photo: photoChange } : {}),
      };
      const saved = item ? await update(item.id, input) : await create(input);
      toast({ message: item ? 'Alterações salvas.' : `${saved.name}: guardado na lista.` });
      onClose();
    } catch (err) {
      setError(errorMessage(err));
      setStage('idle');
    }
  }

  async function doDelete() {
    if (!item || busy) return;
    setStage('saving');
    setError(null);
    try {
      await remove(item.id);
      toast({ message: 'Apagado.' });
      onClose();
    } catch (err) {
      setError(errorMessage(err));
      setStage('idle');
    }
  }

  const saveLabel = stage === 'uploading' ? 'Enviando a foto…' : stage === 'saving' ? 'Salvando…' : 'Salvar';

  return (
    <Sheet title={item ? 'Editar' : 'Nova coisa'} onClose={onClose}>
      <form onSubmit={(e) => void submit(e)} className="flex min-h-0 flex-1 flex-col" noValidate>
        <SheetScroll>
          <div className="space-y-5 pt-2">
            <PhotoField photo={photo} onChange={setPhoto} />

            <div>
              <label htmlFor="item-name" className="label">
                O que é?
              </label>
              <input
                id="item-name"
                ref={nameInput}
                data-autofocus={item ? undefined : ''}
                className="field"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (nameError) setNameError(null); // o erro some assim que a pessoa começa a corrigir
                }}
                maxLength={120}
                autoComplete="off"
                enterKeyHint="next"
                placeholder="Ex.: rímel à prova d’água"
                aria-invalid={nameError ? true : undefined}
                aria-describedby={nameError ? 'item-name-error' : undefined}
              />
              {nameError && (
                <p id="item-name-error" className="mt-1.5 text-sm text-danger" role="alert">
                  {nameError}
                </p>
              )}
            </div>

            <Segmented legend="Categoria" value={category} onChange={setCategory} options={options(CATEGORIES, CATEGORY_LABEL)} columns={4} />

            <div className="grid gap-5 min-[420px]:grid-cols-2">
              <div>
                <label htmlFor="item-brand" className="label">
                  Marca
                </label>
                <input id="item-brand" className="field" value={brand} onChange={(e) => setBrand(e.target.value)} maxLength={80} autoComplete="off" />
              </div>
              <div>
                <label htmlFor="item-where" className="label">
                  Onde viu
                </label>
                <input id="item-where" className="field" value={whereSeen} onChange={(e) => setWhereSeen(e.target.value)} maxLength={200} autoComplete="off" />
              </div>
            </div>

            <Segmented legend="Prioridade" value={priority} onChange={setPriority} options={options(PRIORITIES, PRIORITY_LABEL)} columns={3} />
            <Segmented legend="Como descobri" value={origin} onChange={setOrigin} options={options(ORIGINS, ORIGIN_LABEL)} columns={1} />

            <div>
              <label htmlFor="item-notes" className="label">
                Observações
              </label>
              <textarea id="item-notes" className="field min-h-[96px]" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={1000} placeholder="Tom, tamanho, o que ela disse sobre isso…" />
            </div>

            <div className="space-y-3">
              <Segmented legend="Pago com" value={paidWith} onChange={setPaidWith} options={options(PAID_WITHS, PAID_WITH_LABEL)} columns={2} />
              {paidWith === 'CAIXINHA' && (
                <p role="note" className="flex items-start gap-2 rounded-control bg-warn-soft px-3.5 py-3 text-sm text-warn-ink">
                  <Icon name="alert" className="mt-0.5 h-5 w-5 shrink-0" />
                  {CAIXINHA_REMINDER}
                </p>
              )}
            </div>

            {item?.status === 'COMPRADO' && (
              <p className="text-sm text-soft">{item.purchasedAt ? `Comprado em ${formatShortDay(item.purchasedAt)}.` : 'Já comprado.'}</p>
            )}

            {item && (
              <div className="border-t border-line pt-4">
                {confirmingDelete ? (
                  <div className="space-y-3" role="alertdialog" aria-label="Confirmar exclusão">
                    <p className="text-sm">Apagar “{item.name}”? Isso não dá para desfazer.</p>
                    <div className="flex gap-2">
                      <button type="button" className="btn-quiet flex-1" onClick={() => setConfirmingDelete(false)} disabled={busy}>
                        Cancelar
                      </button>
                      <button type="button" className="btn flex-1 bg-danger-solid text-on-primary" onClick={() => void doDelete()} disabled={busy}>
                        Apagar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button type="button" className="btn-ghost !px-0 text-danger" onClick={() => setConfirmingDelete(true)} disabled={busy}>
                    <Icon name="trash" className="h-5 w-5" />
                    Apagar esta coisa
                  </button>
                )}
              </div>
            )}
          </div>
        </SheetScroll>

        <SheetFooter>
          {error && (
            <p className="mb-2 text-sm text-danger" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="btn-primary w-full" disabled={busy}>
            {saveLabel}
          </button>
        </SheetFooter>
      </form>
    </Sheet>
  );
}
