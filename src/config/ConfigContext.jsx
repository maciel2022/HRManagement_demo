import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_PROFILE_ID, DEMO_PROFILES, perfilPorId } from './demo.config';
import { setActiveProfile } from '@/data/database';
import { setLocalization } from '@/lib/format';

const ConfigContext = createContext(null);
const STORAGE_KEY = 'rrhh-demo-profile';

function aplicarBranding(profile) {
  const r = document.documentElement;
  r.style.setProperty('--brand', profile.branding.primaryColor);
  r.style.setProperty('--brand-dark', profile.branding.primaryDark);
  r.style.setProperty('--brand-soft', profile.branding.primarySoft);
  r.style.setProperty('--secondary', profile.branding.secondaryColor);
  document.title = profile.company.name + ' — Gestión de Personas';
  const link = document.querySelector('link[rel="icon"]');
  if (link && profile.branding.favicon) link.setAttribute('href', profile.branding.favicon);
}

export function ConfigProvider({ children }) {
  const [profileId, setProfileId] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_PROFILE_ID;
    } catch {
      return DEFAULT_PROFILE_ID;
    }
  });

  const profile = useMemo(() => perfilPorId(profileId), [profileId]);

  // El dataset se reconstruye para el perfil activo antes del primer render de los módulos.
  setActiveProfile(profile);
  setLocalization(profile.localization);

  useEffect(() => {
    aplicarBranding(profile);
    try {
      localStorage.setItem(STORAGE_KEY, profile.id);
    } catch {
      /* sin persistencia disponible */
    }
  }, [profile]);

  const value = useMemo(
    () => ({
      profile,
      profileId: profile.id,
      empresa: profile.company,
      branding: profile.branding,
      localizacion: profile.localization,
      usuarioDemo: profile.demoUser,
      catalogo: profile.catalog,
      perfiles: DEMO_PROFILES.map((p) => ({
        id: p.id,
        name: p.company.name,
        industry: p.company.industry,
        initials: p.company.initials,
        color: p.branding.primaryColor
      })),
      cambiarPerfil: setProfileId
    }),
    [profile]
  );

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

export function useConfig() {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error('useConfig debe usarse dentro de <ConfigProvider>');
  return ctx;
}
