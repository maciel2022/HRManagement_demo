import { useState } from 'react';
import { useSession } from '@/context/SessionContext';
import { useConfig } from '@/config/ConfigContext';
import { useAuth } from '@/context/AuthContext';
import { Icon, ThemeToggle } from '@/components/ui';
import { catalogoApi } from '@/api';
import { getDb } from '@/data/database';
import { HOY } from '@/data/catalogos';
import { DEMO_ENV_LABEL } from '@/config/demo.config';

export default function Topbar({ onQuickAction }) {
  const { usuario, rol, sucursal, setSucursal, todasLasSucursales, setRuta, q, setQ, toastMsg } = useSession();
  const { empresa } = useConfig();
  const { email, salir } = useAuth();
  const [abierto, setAbierto] = useState(null); // 'suc' | 'qa' | 'notif' | 'user'
  const [leidas, setLeidas] = useState(false);

  const db = getDb();
  const toggle = (k) => setAbierto((a) => (a === k ? null : k));
  const sucursales = [todasLasSucursales, ...catalogoApi.sucursalesNombres()];

  const notifs = [
    { icon: 'assignment_late', color: 'var(--bad-fg)', title: 'Certificado médico pendiente', body: 'Una licencia del 01/09 quedó sin certificado adjunto.', time: 'Hoy 08:15', ruta: 'vacaciones' },
    { icon: 'schedule', color: 'var(--warn-fg)', title: '3 llegadas tarde en la semana', body: db.branches[2].name + ', turno Mañana.', time: 'Hoy 07:52', ruta: 'asistencia' },
    { icon: 'beach_access', color: 'var(--info-fg)', title: '6 solicitudes esperando aprobación', body: 'Vacaciones y licencias en etapa Supervisor.', time: 'Ayer 18:30', ruta: 'vacaciones' },
    { icon: 'request_quote', color: 'var(--warn-fg)', title: '4 adelantos solicitados', body: 'Pendientes de revisión para la liquidación de septiembre.', time: 'Ayer 16:04', ruta: 'adelantos' },
    { icon: 'folder_shared', color: 'var(--bad-fg)', title: 'Documentación por vencer', body: db.documents.filter((d) => d.status === 'Próximo a vencer').length + ' documentos vencen en los próximos 30 días.', time: '01/09 11:20', ruta: 'documentacion' },
    { icon: 'upload_file', color: 'var(--brand)', title: 'Fichadas sin importar', body: 'Último archivo procesado: 31/08/2026.', time: '01/09 07:00', ruta: 'asistencia' }
  ];

  const acciones = [
    { label: 'Nuevo empleado', icon: 'person_add', key: 'nuevoEmpleado', ruta: 'empleados' },
    { label: 'Importar fichadas', icon: 'upload_file', key: 'importar', ruta: 'asistencia' },
    { label: 'Solicitar vacaciones', icon: 'beach_access', key: 'nuevaLicencia', ruta: 'vacaciones' },
    { label: 'Solicitar adelanto', icon: 'request_quote', key: 'nuevoAdelanto', ruta: 'adelantos' },
    { label: 'Publicar anuncio', icon: 'campaign', key: 'nuevoAnuncio', ruta: 'anuncios' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-translucent backdrop-blur border-b border-line px-[26px] h-[66px] flex items-center gap-[14px]">
      <div className="relative flex-1 max-w-[380px]">
        <Icon name="search" size={19} className="absolute left-[11px] top-1/2 -translate-y-1/2 text-muted2" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && setRuta('empleados')}
          placeholder="Buscar empleado, legajo o DNI…"
          className="w-full pl-[37px] pr-3 py-[9px] border border-linestrong rounded-[10px] bg-surface2 text-[13px] outline-none focus:border-brand"
        />
      </div>

      <span className="hidden lg:flex items-center gap-[6px] px-[10px] py-[5px] rounded-full bg-brand-soft text-brand text-[10.5px] font-bold whitespace-nowrap">
        <span className="w-[6px] h-[6px] rounded-full bg-brand" />
        {DEMO_ENV_LABEL}
      </span>

      <div className="flex-1" />

      <div className="relative">
        <button onClick={() => toggle('suc')} className="btn-ghost">
          <Icon name="storefront" size={18} className="text-brand" />
          {sucursal}
          <Icon name="expand_more" size={18} className="text-muted2" />
        </button>
        {abierto === 'suc' && (
          <div className="absolute right-0 top-[46px] w-[260px] card shadow-xl p-[6px] animate-pop z-50">
            {sucursales.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setSucursal(s);
                  setAbierto(null);
                  toastMsg('Sucursal: ' + s);
                }}
                className={
                  'flex items-center justify-between gap-2 w-full text-left px-[10px] py-[9px] rounded-lg text-[12.5px] font-semibold hover:bg-surface3 ' +
                  (sucursal === s ? 'bg-brand-soft' : '')
                }
              >
                <span className="truncate">{s}</span>
                <span className="font-mono text-[11px] text-muted3">
                  {s === todasLasSucursales ? catalogoApi.totalEmpleados() : catalogoApi.porSucursal(s)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative">
        <button onClick={() => toggle('qa')} className="btn-primary">
          <Icon name="bolt" size={18} />
          Acciones
        </button>
        {abierto === 'qa' && (
          <div className="absolute right-0 top-[46px] w-[240px] card shadow-xl p-[6px] animate-pop z-50">
            {acciones.map((a) => (
              <button
                key={a.key}
                onClick={() => {
                  setAbierto(null);
                  setRuta(a.ruta);
                  onQuickAction?.(a.key);
                }}
                className="flex items-center gap-[10px] w-full text-left px-[10px] py-[9px] rounded-lg text-[12.5px] font-semibold hover:bg-surface3"
              >
                <Icon name={a.icon} size={18} className="text-brand" />
                {a.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <ThemeToggle />

      <div className="relative">
        <button
          onClick={() => toggle('notif')}
          className="relative w-[38px] h-[38px] border border-linestrong rounded-[10px] bg-surface hover:bg-surface2 grid place-items-center"
          aria-label="Notificaciones"
        >
          <Icon name="notifications" size={20} className="text-ink2" />
          <span className="absolute -top-[5px] -right-[5px] min-w-[18px] h-[18px] px-1 rounded-full bg-bad text-surface text-[10.5px] font-bold grid place-items-center">
            {leidas ? 0 : notifs.length}
          </span>
        </button>
        {abierto === 'notif' && (
          <div className="absolute right-0 top-[46px] w-[360px] card shadow-2xl overflow-hidden animate-pop z-50">
            <div className="px-[15px] py-[13px] border-b border-line2 flex items-center justify-between">
              <span className="text-[13px] font-bold">Notificaciones</span>
              <button
                onClick={() => {
                  setLeidas(true);
                  toastMsg('Notificaciones marcadas como leídas');
                }}
                className="text-brand text-[11.5px] font-bold"
              >
                Marcar todas leídas
              </button>
            </div>
            <div className="max-h-[380px] overflow-y-auto">
              {notifs.map((n) => (
                <button
                  key={n.title}
                  onClick={() => {
                    setRuta(n.ruta);
                    setAbierto(null);
                  }}
                  className={'flex gap-[11px] w-full text-left px-[15px] py-3 border-b border-canvas hover:bg-surface2 ' + (leidas ? 'bg-surface' : 'bg-surface2')}
                >
                  <Icon name={n.icon} size={19} style={{ color: n.color }} className="mt-[1px]" />
                  <span className="flex-1 min-w-0">
                    <span className="block text-[12.5px] font-bold mb-[2px]">{n.title}</span>
                    <span className="block text-xs text-muted leading-[1.45]">{n.body}</span>
                    <span className="block font-mono text-[10.5px] text-muted2 mt-1">{n.time}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="relative pl-[14px] border-l border-line">
        <button
          onClick={() => toggle('user')}
          className="flex items-center gap-[10px] rounded-[10px] px-1 py-1 -mx-1 hover:bg-surface3"
          aria-label="Menú de usuario"
        >
          {usuario.avatar ? (
            <img src={usuario.avatar} alt={usuario.nombre} className="w-9 h-9 rounded-[10px] object-cover" />
          ) : (
            <div className="w-9 h-9 rounded-[10px] bg-brand-soft text-brand grid place-items-center text-[13px] font-extrabold">
              {usuario.iniciales}
            </div>
          )}
          <div className="text-left">
            <div className="text-[12.5px] font-bold leading-tight">{usuario.nombre}</div>
            <div className="text-[11px] text-muted3 font-semibold">{rol}</div>
          </div>
          <Icon name="expand_more" size={18} className="text-muted2" />
        </button>
        {abierto === 'user' && (
          <div className="absolute right-0 top-[52px] w-[250px] card shadow-xl overflow-hidden animate-pop z-50">
            <div className="px-[13px] py-[12px] border-b border-line2">
              <div className="text-[12.5px] font-bold leading-tight">{usuario.nombre}</div>
              <div className="text-[11px] text-muted3 font-semibold mb-[5px]">{rol}</div>
              <div className="font-mono text-[11px] text-muted2 break-all">{email}</div>
            </div>
            <div className="p-[6px]">
              <button
                onClick={() => {
                  setAbierto(null);
                  salir();
                }}
                className="flex items-center gap-[10px] w-full text-left px-[10px] py-[9px] rounded-lg text-[12.5px] font-semibold text-bad hover:bg-bad-soft"
              >
                <Icon name="logout" size={18} />
                Cerrar sesión
              </button>
            </div>
          </div>
        )}
      </div>

      <span className="hidden 2xl:block font-mono text-xs text-muted3 whitespace-nowrap">{HOY.largo}</span>
      <span className="sr-only">{empresa.name}</span>
    </header>
  );
}
