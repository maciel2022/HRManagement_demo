import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { ACCESO_DEMO } from '@/config/demo.config';

const AuthContext = createContext(null);
const STORAGE_KEY = 'rrhh-demo-auth';

// "Recordarme" define dónde vive la sesión:
//   marcado   → localStorage   (sobrevive al cierre del navegador)
//   sin marcar → sessionStorage (sobrevive al refresco, se limpia al cerrar la pestaña)
// En ambos casos un F5 no devuelve al usuario a la pantalla de ingreso.
function almacenamientos() {
  try {
    return [window.localStorage, window.sessionStorage];
  } catch {
    return [];
  }
}

function leerSesion() {
  for (const store of almacenamientos()) {
    try {
      const raw = store.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      /* sin persistencia disponible */
    }
  }
  return null;
}

function guardarSesion(sesion, recordarme) {
  const [local, session] = almacenamientos();
  try {
    local?.removeItem(STORAGE_KEY);
    session?.removeItem(STORAGE_KEY);
    (recordarme ? local : session)?.setItem(STORAGE_KEY, JSON.stringify(sesion));
  } catch {
    /* sin persistencia disponible */
  }
}

function borrarSesion() {
  for (const store of almacenamientos()) {
    try {
      store.removeItem(STORAGE_KEY);
    } catch {
      /* sin persistencia disponible */
    }
  }
}

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(leerSesion);

  const ingresar = useCallback((email, password, recordarme) => {
    const mail = (email ?? '').trim().toLowerCase();
    if (mail !== ACCESO_DEMO.email.toLowerCase() || password !== ACCESO_DEMO.password) {
      return { ok: false, error: 'El correo o la contraseña no son correctos.' };
    }
    const nueva = { email: ACCESO_DEMO.email, desde: new Date().toISOString(), recordarme: !!recordarme };
    guardarSesion(nueva, recordarme);
    setSesion(nueva);
    return { ok: true };
  }, []);

  const salir = useCallback(() => {
    borrarSesion();
    setSesion(null);
  }, []);

  const value = useMemo(
    () => ({ autenticado: !!sesion, sesion, email: sesion?.email ?? null, ingresar, salir }),
    [sesion, ingresar, salir]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
