import { thumb } from '../lib/cloudinary';
import { formatShortDay } from '../lib/dates';
import { CATEGORY_LABEL, ORIGIN_LABEL } from '../lib/labels';
import type { Item } from '../lib/types';
import { Icon } from './Icon';

function Thumb({ item }: { item: Item }) {
  if (item.photoUrl) {
    return (
      <img
        src={thumb(item.photoUrl, 168)}
        width={56}
        height={56}
        loading="lazy"
        decoding="async"
        alt=""
        className="h-14 w-14 shrink-0 rounded-thumb bg-sunken object-cover"
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className="grid h-14 w-14 shrink-0 place-items-center rounded-thumb bg-sunken font-display text-xl text-soft"
    >
      {item.name.charAt(0).toUpperCase()}
    </span>
  );
}

interface Props {
  item: Item;
  onOpen: (item: Item) => void;
  onBuy: (item: Item) => void;
  onUndo: (item: Item) => void;
}

export function ItemRow({ item, onOpen, onBuy, onUndo }: Props) {
  const pending = item.status === 'PENDENTE';
  const subtitle = [item.brand, CATEGORY_LABEL[item.category]].filter(Boolean).join(', ');
  const caixinha = item.paidWith === 'CAIXINHA';

  return (
    <li className="flex items-center gap-3 border-b border-line py-3 last:border-b-0">
      <button
        type="button"
        onClick={() => onOpen(item)}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
        aria-label={`Abrir ${item.name}`}
      >
        <Thumb item={item} />
        <span className="min-w-0 flex-1">
          <span className="line-clamp-2 block font-semibold leading-snug">{item.name}</span>
          <span className="block truncate text-sm text-soft">{subtitle}</span>
          {pending ? (
            <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-soft">
              {item.priority === 'ALTA' && (
                <span className="rounded-full bg-accent px-2 text-xs font-semibold leading-5 text-accent-ink">
                  Prioridade alta
                </span>
              )}
              <span>{ORIGIN_LABEL[item.origin]}</span>
            </span>
          ) : (
            <span className={`block truncate text-sm ${caixinha ? 'font-medium text-warn-ink' : 'text-soft'}`}>
              {item.purchasedAt ? `Comprado em ${formatShortDay(item.purchasedAt)}` : 'Comprado'}
              {caixinha ? ' com a caixinha' : ''}
            </span>
          )}
        </span>
      </button>

      {pending ? (
        <button type="button" className="btn-success shrink-0 !px-3.5" onClick={() => onBuy(item)}>
          <Icon name="check" className="h-5 w-5" />
          Comprei
        </button>
      ) : (
        <button type="button" className="btn-ghost shrink-0 !px-3" onClick={() => onUndo(item)}>
          <Icon name="undo" className="h-5 w-5" />
          Desfazer
        </button>
      )}
    </li>
  );
}
