/** @type {import('tailwindcss').Config} */
// Los colores de marca salen de variables CSS que ConfigProvider setea desde
// demo.config.js (branding.primaryColor / primaryDark / primarySoft / secondaryColor).
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#f6f5f2',
        surface: '#ffffff',
        line: '#e6e3dd',
        line2: '#f0eeea',
        ink: '#262521',
        ink2: '#55534c',
        muted: '#7c7a72',
        muted2: '#a5a29a',
        brand: {
          DEFAULT: 'var(--brand)',
          dark: 'var(--brand-dark)',
          soft: 'var(--brand-soft)'
        },
        secondary: 'var(--secondary)',
        ok: { DEFAULT: '#1f7a4d', soft: '#e7f3ec' },
        warn: { DEFAULT: '#9a6a10', soft: '#fbf1de' },
        bad: { DEFAULT: '#a83232', soft: '#fbeaea' },
        info: { DEFAULT: '#2f5fa8', soft: '#e9eff9' },
        vio: { DEFAULT: '#6b4a9e', soft: '#f0eaf9' },
        grey: { DEFAULT: '#6b6a63', soft: '#eeece7' }
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
