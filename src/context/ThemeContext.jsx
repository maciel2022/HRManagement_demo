import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);
const STORAGE_KEY = 'rrhh-demo-theme';
const TEMAS = ['light', 'dark'];

function leerGuardado() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return TEMAS.includes(v) ? v : null;
  } catch {
    return null;
  }
}

function preferenciaDelSistema() {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

// Elección guardada → preferencia del sistema operativo → claro.
function temaInicial() {
  return leerGuardado() ?? preferenciaDelSistema();
}

function persistir(t) {
  try {
    localStorage.setItem(STORAGE_KEY, t);
  } catch {
    /* sin persistencia disponible */
  }
}

export function ThemeProvider({ children }) {
  const [tema, setTema] = useState(temaInicial);
  const [siguiendoAlSistema, setSiguiendo] = useState(() => leerGuardado() === null);

  // El atributo va en <html>: la paleta de index.css cuelga de :root.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tema);
  }, [tema]);

  // Mientras no haya elección explícita, la aplicación sigue al sistema en vivo.
  useEffect(() => {
    if (!siguiendoAlSistema) return undefined;
    let mq;
    try {
      mq = window.matchMedia('(prefers-color-scheme: dark)');
    } catch {
      return undefined;
    }
    const alCambiar = (e) => setTema(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', alCambiar);
    return () => mq.removeEventListener('change', alCambiar);
  }, [siguiendoAlSistema]);

  const ponerTema = useCallback((t) => {
    if (!TEMAS.includes(t)) return;
    setSiguiendo(false);
    persistir(t);
    setTema(t);
  }, []);

  const alternarTema = useCallback(() => {
    setTema((actual) => {
      const proximo = actual === 'dark' ? 'light' : 'dark';
      persistir(proximo);
      return proximo;
    });
    setSiguiendo(false);
  }, []);

  const value = useMemo(
    () => ({ tema, esOscuro: tema === 'dark', alternarTema, ponerTema, siguiendoAlSistema }),
    [tema, alternarTema, ponerTema, siguiendoAlSistema]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme debe usarse dentro de <ThemeProvider>');
  return ctx;
}
