import { useState } from 'react';
import { useConfig } from '@/config/ConfigContext';
import { useAuth } from '@/context/AuthContext';
import { Icon, ThemeToggle } from '@/components/ui';
import { ACCESO_DEMO, CLIENT_SWITCHER_ENABLED, DEMO_ENV_LABEL } from '@/config/demo.config';

const DESTACADOS = [
  { icon: 'groups', title: 'Legajos y dotación', body: 'Directorio completo, perfiles y documentación del personal.' },
  { icon: 'schedule', title: 'Asistencia y turnos', body: 'Fichadas, incidencias y cobertura diaria por unidad.' },
  { icon: 'payments', title: 'Nómina y liquidaciones', body: 'Recibos, adelantos y cierre mensual con trazabilidad.' }
];

export default function Login() {
  const { empresa, branding, perfiles, profileId, cambiarPerfil } = useConfig();
  const { ingresar } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verPass, setVerPass] = useState(false);
  const [recordarme, setRecordarme] = useState(true);
  const [error, setError] = useState(null);
  const [aviso, setAviso] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const enviar = (e) => {
    e.preventDefault();
    if (enviando) return;
    setError(null);
    setAviso(null);
    if (!email.trim() || !password) {
      setError('Completá el correo y la contraseña para continuar.');
      return;
    }
    setEnviando(true);
    setTimeout(() => {
      const res = ingresar(email, password, recordarme);
      if (!res.ok) {
        setEnviando(false);
        setError(res.error);
      }
      // Si el ingreso es correcto el componente se desmonta: no hace falta apagar el estado.
    }, 600);
  };

  const completar = () => {
    setEmail(ACCESO_DEMO.email);
    setPassword(ACCESO_DEMO.password);
    setError(null);
    setAviso(null);
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col lg:flex-row">
      {/* Panel de marca */}
      <aside
        className="relative overflow-hidden text-white px-6 py-[18px] sm:px-10 lg:w-[46%] lg:max-w-[620px] lg:px-14 lg:py-12 flex flex-col justify-between"
        style={{ background: `linear-gradient(150deg, ${branding.primaryColor} 0%, ${branding.primaryDark} 100%)` }}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 -right-28 w-[380px] h-[380px] rounded-full opacity-[.13]"
          style={{ background: branding.secondaryColor }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 -left-24 w-[420px] h-[420px] rounded-full bg-white opacity-[.06]"
        />

        <div className="relative flex items-center gap-[13px]">
          <div className="w-11 h-11 rounded-[12px] bg-white/15 backdrop-blur grid place-items-center font-extrabold text-[17px] tracking-[-.5px] shrink-0">
            {empresa.initials}
          </div>
          <div className="min-w-0">
            <div className="text-[15px] font-extrabold tracking-[-.3px] truncate">{empresa.name}</div>
            <div className="text-[11.5px] font-semibold text-white/70 truncate">{empresa.industry}</div>
          </div>
        </div>

        {/* En pantallas chicas el panel queda como encabezado: el formulario no debe caer debajo del pliegue. */}
        <div className="relative hidden lg:block">
          <h1 className="m-0 text-[27px] sm:text-[33px] lg:text-[38px] font-extrabold leading-[1.15] tracking-[-1px] max-w-[15ch]">
            {empresa.tagline}
          </h1>
          <p className="mt-3 mb-8 max-w-[46ch] text-[13.5px] leading-[1.6] text-white/75">
            Toda la operación de Recursos Humanos de {empresa.shortName} en un solo lugar: personal, asistencia,
            licencias, nómina y reportes.
          </p>
          <ul className="m-0 p-0 list-none flex flex-col gap-[18px] max-w-[42ch]">
            {DESTACADOS.map((d) => (
              <li key={d.icon} className="flex gap-[13px]">
                <span className="w-9 h-9 shrink-0 rounded-[10px] bg-white/12 grid place-items-center">
                  <Icon name={d.icon} size={19} />
                </span>
                <span>
                  <span className="block text-[13px] font-bold mb-[2px]">{d.title}</span>
                  <span className="block text-[12.5px] leading-[1.5] text-white/70">{d.body}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative hidden lg:block font-mono text-[11px] text-white/55">
          {empresa.contact.web} · {empresa.contact.phone}
        </div>
      </aside>

      {/* Formulario */}
      <main className="flex-1 flex items-center justify-center px-5 py-10 sm:px-8 lg:py-12">
        <div className="w-full max-w-[420px]">
          <div className="flex justify-end mb-3">
            <ThemeToggle />
          </div>
          <div className="mb-6">
            <h2 className="m-0 mb-[6px] text-[23px] font-extrabold tracking-[-.5px]">Iniciar sesión</h2>
            <p className="m-0 text-[13px] text-muted">Ingresá con tu cuenta corporativa para acceder al sistema.</p>
          </div>

          <form onSubmit={enviar} noValidate className="card p-[22px] sm:p-6 shadow-sm">
            <div className="mb-[15px]">
              <label className="label" htmlFor="login-email">
                Correo electrónico
              </label>
              <div className="relative">
                <Icon name="mail" size={18} className="absolute left-[11px] top-1/2 -translate-y-1/2 text-muted2" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="username"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nombre@empresa.com"
                  className="input pl-[36px]"
                />
              </div>
            </div>

            <div className="mb-[15px]">
              <label className="label" htmlFor="login-password">
                Contraseña
              </label>
              <div className="relative">
                <Icon name="lock" size={18} className="absolute left-[11px] top-1/2 -translate-y-1/2 text-muted2" />
                <input
                  id="login-password"
                  type={verPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input pl-[36px] pr-[38px]"
                />
                <button
                  type="button"
                  onClick={() => setVerPass((v) => !v)}
                  aria-label={verPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute right-[9px] top-1/2 -translate-y-1/2 w-[26px] h-[26px] grid place-items-center rounded-md text-muted2 hover:text-ink2 hover:bg-surface3"
                >
                  <Icon name={verPass ? 'visibility_off' : 'visibility'} size={18} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 flex-wrap mb-[18px]">
              <label className="flex items-center gap-[7px] text-[12.5px] font-semibold text-ink2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={recordarme}
                  onChange={(e) => setRecordarme(e.target.checked)}
                  className="w-[15px] h-[15px] rounded border-linestrong accent-[var(--brand)] cursor-pointer"
                />
                Recordarme
              </label>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setAviso(`Escribí a ${empresa.contact.email} y el equipo de Recursos Humanos restablece tu acceso.`);
                }}
                className="text-[12.5px] font-bold text-brand hover:text-brand-dark"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-[9px] mb-[15px] px-[11px] py-[10px] rounded-[9px] bg-bad-soft text-bad text-[12.5px] font-semibold leading-[1.45]"
              >
                <Icon name="error" size={18} className="mt-[1px] shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {aviso && (
              <div className="flex items-start gap-[9px] mb-[15px] px-[11px] py-[10px] rounded-[9px] bg-info-soft text-info text-[12.5px] font-semibold leading-[1.45]">
                <Icon name="info" size={18} className="mt-[1px] shrink-0" />
                <span>{aviso}</span>
              </div>
            )}

            <button type="submit" disabled={enviando} className="btn-primary w-full justify-center py-[11px] disabled:opacity-70 disabled:cursor-default">
              {enviando ? (
                <>
                  <Icon name="progress_activity" size={18} className="animate-spin" />
                  Verificando…
                </>
              ) : (
                <>
                  <Icon name="login" size={18} />
                  Iniciar sesión
                </>
              )}
            </button>

            <div className="mt-[18px] pt-[16px] border-t border-line2">
              <div className="rounded-[10px] bg-brand-soft px-[13px] py-[11px]">
                <div className="flex items-center justify-between gap-2 mb-[7px]">
                  <span className="flex items-center gap-[6px] text-[11.5px] font-extrabold text-brand">
                    <Icon name="key" size={16} />
                    Acceso de prueba
                  </span>
                  <button type="button" onClick={completar} className="text-[11.5px] font-bold text-brand hover:text-brand-dark underline underline-offset-2">
                    Completar
                  </button>
                </div>
                <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-[10px] gap-y-[3px] font-mono text-[11.5px] text-ink2">
                  <dt className="text-muted">Usuario</dt>
                  <dd className="m-0 break-all">{ACCESO_DEMO.email}</dd>
                  <dt className="text-muted">Clave</dt>
                  <dd className="m-0">{ACCESO_DEMO.password}</dd>
                </dl>
              </div>
            </div>
          </form>

          {CLIENT_SWITCHER_ENABLED && perfiles.length > 1 && (
            <div className="mt-[22px]">
              <div className="text-[10.5px] uppercase tracking-[.08em] text-muted2 font-bold mb-[9px] text-center">
                Empresa
              </div>
              <div className="flex flex-wrap justify-center gap-[7px]">
                {perfiles.map((p) => {
                  const activo = p.id === profileId;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => cambiarPerfil(p.id)}
                      aria-pressed={activo}
                      className={
                        'flex items-center gap-[7px] px-[11px] py-[7px] rounded-full border text-[12px] font-bold transition-colors ' +
                        (activo ? 'bg-surface border-brand text-brand' : 'bg-transparent border-linestrong text-muted hover:bg-surface')
                      }
                    >
                      <span className="w-[9px] h-[9px] rounded-full shrink-0" style={{ background: p.color }} />
                      {p.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-[26px] flex flex-col items-center gap-[10px]">
            <span className="flex items-center gap-[6px] px-[10px] py-[5px] rounded-full bg-brand-soft text-brand text-[10.5px] font-bold">
              <span className="w-[6px] h-[6px] rounded-full bg-brand" />
              {DEMO_ENV_LABEL}
            </span>
            <span className="text-[11px] text-muted2 text-center">
              {empresa.name} · {empresa.contact.address}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
