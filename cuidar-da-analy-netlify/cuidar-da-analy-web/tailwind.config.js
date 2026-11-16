/** @type {import('tailwindcss').Config} */
// Cores vêm de variáveis CSS (index.css): o modo escuro só troca os valores, sem variantes dark: espalhadas.
const color = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: color('bg'),
        surface: color('surface'),
        sunken: color('sunken'),
        ink: color('ink'),
        soft: color('soft'),
        line: color('line'),
        primary: color('primary'),
        'primary-strong': color('primary-strong'),
        'on-primary': color('on-primary'),
        accent: color('accent'),
        'accent-ink': color('accent-ink'),
        success: color('success'),
        'success-soft': color('success-soft'),
        'success-ink': color('success-ink'),
        warn: color('warn'),
        'warn-soft': color('warn-soft'),
        'warn-ink': color('warn-ink'),
        danger: color('danger'),
        'danger-solid': color('danger-solid'),
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Figtree', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      borderRadius: { control: '14px', thumb: '12px', sheet: '24px' },
      keyframes: {
        sheetUp: { from: { transform: 'translateY(24px)', opacity: '0' }, to: { transform: 'none', opacity: '1' } },
        fade: { from: { opacity: '0' }, to: { opacity: '1' } },
      },
      animation: { 'sheet-up': 'sheetUp .22s ease-out', fade: 'fade .18s ease-out' },
    },
  },
  plugins: [],
};
