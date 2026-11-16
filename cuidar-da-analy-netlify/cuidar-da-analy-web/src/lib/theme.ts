export type ThemePref = 'auto' | 'light' | 'dark';
const KEY = 'analy-theme';

export function getThemePref(): ThemePref {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : 'auto';
  } catch {
    return 'auto';
  }
}

export function applyTheme(pref: ThemePref) {
  try {
    localStorage.setItem(KEY, pref);
  } catch {
    /* modo privado: só não lembra a escolha */
  }
  const dark = pref === 'dark' || (pref === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
}
