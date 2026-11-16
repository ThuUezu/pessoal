import { useId } from 'react';

interface Option<T extends string> {
  value: T;
  label: string;
}

const COLUMNS = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-2 min-[400px]:grid-cols-4',
} as const;

interface SegmentedProps<T extends string> {
  legend: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  columns?: keyof typeof COLUMNS;
  /** Esconde o título na tela mas mantém para leitores de tela. */
  hideLegend?: boolean;
}

/** Escolha única com radios nativos (teclado e leitor de tela funcionam de graça), em formato de botões. */
export function Segmented<T extends string>({ legend, value, options, onChange, columns = 3, hideLegend = false }: SegmentedProps<T>) {
  const name = useId();
  return (
    <fieldset>
      <legend className={hideLegend ? 'sr-only' : 'label'}>{legend}</legend>
      <div className={`grid gap-2 ${COLUMNS[columns]}`}>
        {options.map((o) => (
          <label key={o.value} className="block">
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={o.value === value}
              onChange={() => onChange(o.value)}
              className="peer sr-only"
            />
            <span className="flex min-h-[44px] items-center justify-center rounded-control border border-line bg-surface px-3 text-center text-[15px] font-medium text-ink transition-colors peer-checked:border-primary peer-checked:bg-primary peer-checked:text-on-primary peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary">
              {o.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
