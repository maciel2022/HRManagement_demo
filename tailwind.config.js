/** @type {import('tailwindcss').Config} */
// Los colores de marca salen de variables CSS que ConfigProvider setea desde
// demo.config.js (branding.primaryColor / primaryDark / primarySoft / secondaryColor).
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--canvas)',
        surface: 'var(--surface)',
        surface2: 'var(--surface-2)',
        surface3: 'var(--surface-3)',
        translucent: 'var(--surface-translucent)',
        line: 'var(--line)',
        line2: 'var(--line-2)',
        linestrong: 'var(--line-strong)',
        ink: 'var(--ink)',
        ink2: 'var(--ink-2)',
        muted: 'var(--muted)',
        muted2: 'var(--muted-2)',
        muted3: 'var(--muted-3)',
        overlay: 'var(--overlay)',
        toast: 'var(--toast-bg)',
        toastink: 'var(--toast-ink)',
        brandink: 'var(--brand-ink)',
        brand: {
          DEFAULT: 'var(--brand)',
          dark: 'var(--brand-dark)',
          soft: 'var(--brand-soft)',
          ink: 'var(--brand-ink)'
        },
        secondary: 'var(--secondary)',
        ok: { DEFAULT: 'var(--ok-fg)', soft: 'var(--ok-bg)' },
        warn: { DEFAULT: 'var(--warn-fg)', soft: 'var(--warn-bg)' },
        bad: { DEFAULT: 'var(--bad-fg)', soft: 'var(--bad-bg)' },
        info: { DEFAULT: 'var(--info-fg)', soft: 'var(--info-bg)' },
        vio: { DEFAULT: 'var(--vio-fg)', soft: 'var(--vio-bg)' },
        grey: { DEFAULT: 'var(--grey-fg)', soft: 'var(--grey-bg)' }
      },
      fontFamily: {
        sans: ['Manrope', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace']
      },
      keyframes: {
        fade: { from: { opacity: '0', transform: 'translateY(6px)' }, to: { opacity: '1', transform: 'none' } },
        pop: { from: { opacity: '0', transform: 'translateY(10px) scale(.98)' }, to: { opacity: '1', transform: 'none' } }
      },
      animation: {
        fade: 'fade .2s ease-out',
        pop: 'pop .18s ease-out'
      }
    }
  },
  plugins: []
};
