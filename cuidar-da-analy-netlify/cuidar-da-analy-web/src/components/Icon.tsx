import type { ReactNode } from 'react';

const PATHS = {
  heart: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />,
  gift: (
    <>
      <path d="M4 11h16v9H4z" />
      <path d="M3 7.5h18V11H3z" />
      <path d="M12 7.5V20" />
      <path d="M12 7.5C10.6 4.5 7 4.8 7 6.5S10 7.5 12 7.5zm0 0c1.4-3 5-2.7 5-1s-3 1-5 1z" />
    </>
  ),
  image: (
    <>
      <path d="M4 5h16v14H4z" />
      <path d="M4 16l4.5-4.5L12 15l3-3 5 5" />
      <circle cx="9" cy="9.5" r="1.4" />
    </>
  ),
  mail: (
    <>
      <path d="M3 6h18v12H3z" />
      <path d="M3.5 7l8.5 6.5L20.5 7" />
    </>
  ),
  dots: (
    <>
      <circle cx="6" cy="12" r="1.2" />
      <circle cx="12" cy="12" r="1.2" />
      <circle cx="18" cy="12" r="1.2" />
    </>
  ),
  camera: (
    <>
      <path d="M4 8h3l1.8-2.5h6.4L17 8h3v11H4z" />
      <circle cx="12" cy="13.3" r="3.4" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  undo: <path d="M7 6L3 10l4 4M3 10h11a5 5 0 0 1 0 10H9" />,
  trash: <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  alert: <path d="M12 4l9 16H3zM12 10v4M12 17v.01" />,
  refresh: <path d="M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6" />,
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof PATHS;

export function Icon({ name, className = 'h-6 w-6' }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}
