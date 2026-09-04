import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { can as puede } from '@/lib/permissions';
import { useConfig } from '@/config/ConfigContext';

const SessionContext = createContext(null);
const TODAS = 'Todas las sucursales';

export function SessionProvider({ children }) {
  const { usuarioDemo, profileId } = useConfig();
  const [rol, setRol] = useState(usuarioDemo.role);
  const [sucursal, setSucursal] = useState(TODAS);
  const [ruta, setRuta] = useState('inicio');
  const [q, setQ] = useState('');
  const [filtros, setFiltrosRaw] = useState({ area: 'Todas', puesto: 'Todos', estado: 'Todos', turno: 'Todos' });
  const [toast, setToastRaw] = useState(null);
  const timer = useRef(null);

  // Al cambiar de empresa demo se reinicia el contexto de sesión
  useEffect(() => {
    setRol(usuarioDemo.role);
    setSucursal(TODAS);
    setRuta('inicio');
    setQ('');
    setFiltrosRaw({ area: 'Todas', puesto: 'Todos', estado: 'Todos', turno: 'Todos' });
  }, [profileId, usuarioDemo.role]);

  const toastMsg = useCallback((msg) => {
    setToastRaw(msg);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToastRaw(null), 2600);
  }, []);

  const setFiltros = useCallback((patch) => setFiltrosRaw((f) => ({ ...f, ...patch })), []);
  const resetFiltros = useCallback(() => {
    setFiltrosRaw({ area: 'Todas', puesto: 'Todos', estado: 'Todos', turno: 'Todos' });
    setQ('');
  }, []);

  const value = useMemo(
    () => ({
      usuario: { nombre: usuarioDemo.name, iniciales: usuarioDemo.initials, avatar: usuarioDemo.avatar },
      rol,
      setRol: (r) => {
        setRol(r);
        setRuta('inicio');
      },
      sucursal,
      setSucursal,
      todasLasSucursales: TODAS,
      ruta,
      setRuta,
      q,
      setQ,
      filtros,
      setFiltros,
      resetFiltros,
      toast,
      toastMsg,
      can: (entidad, habilidad) => puede(rol, entidad, habilidad),
      // contexto que se pasa a la capa de API (en producción: usuario autenticado + token)
      ctx: { usuario: usuarioDemo.name, rol, sucursal }
    }),
    [rol, sucursal, ruta, q, filtros, toast, toastMsg, setFiltros, resetFiltros, usuarioDemo]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession debe usarse dentro de <SessionProvider>');
  return ctx;
}
