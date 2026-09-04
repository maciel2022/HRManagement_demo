import { useState } from 'react';
import { useSession } from '@/context/SessionContext';
import { useConfig } from '@/config/ConfigContext';
import { MODULOS } from '@/modules/registry';
import { MODULOS_POR_ROL } from '@/lib/permissions';
import { ROLES } from '@/data/catalogos';
import { CLIENT_SWITCHER_ENABLED, DEMO_ENV_LABEL } from '@/config/demo.config';
import { Icon } from '@/components/ui';
import { catalogoApi } from '@/api';
import { TONOS } from '@/lib/format';
import { getDb } from '@/data/database';

export default function Sidebar() {
  const { ruta, setRuta, rol, setRol, sucursal } = useSession();
  const { empresa, perfiles, profileId, cambiarPerfil } = useConfig();
  const [abierto, setAbierto] = useState(false);

  const permitidos = MODULOS_POR_ROL[rol];
  const visibles = permitidos ? MODULOS.filter((m) => permitidos.includes(m.id)) : MODULOS;

  const db = getDb();
  const badges = {
    empleados: { value: rol === 'Empleado' ? 1 : catalogoApi.dotacion(sucursal), tone: 'grey' },
    asistencia: { value: db.incs.length, tone: 'bad' },
    vacaciones: { value: db.reqs.filter((r) => ['Pendiente', 'En revisión'].includes(r.estado)).length, tone: 'warn' },
    adelantos: { value: db.adels.filter((a) => ['Solicitado', 'En revisión'].includes(a.estado)).length, tone: 'warn' },
    documentacion: { value: db.documents.filter((d) => d.status === 'Próximo a vencer').length, tone: 'warn' }
  };

  return (
    <aside className="w-[250px] shrink-0 bg-surface border-r border-line sticky top-0 h-screen flex flex-col">
      <div className="relative border-b border-line2">
        <button
          onClick={() => CLIENT_SWITCHER_ENABLED && setAbierto((a) => !a)}
          className="w-full px-5 pt-5 pb-4 flex items-center gap-[11px] text-left hover:bg-surface2"
        >
          <div className="w-9 h-9 rounded-[10px] bg-brand text-brandink grid place-items-center font-extrabold text-[15px] tracking-[-.5px] shrink-0">
            {empresa.initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold tracking-[-.2px] truncate">{empresa.name}</div>
            <div className="text-[11px] text-muted3 font-medium truncate">{empresa.tagline}</div>
          </div>
          {CLIENT_SWITCHER_ENABLED && <Icon name="unfold_more" size={17} className="text-muted2 shrink-0" />}
        </button>

        {abierto && (
          <div className="absolute left-[10px] right-[10px] top-[72px] card shadow-xl p-[6px] animate-pop z-50">
            <div className="px-[10px] pt-1 pb-2 text-[10px] uppercase tracking-[.08em] text-muted2 font-bold">
              Empresa de la demo
            </div>
            {perfiles.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  cambiarPerfil(p.id);
                  setAbierto(false);
                }}
                className={
                  'flex items-center gap-[10px] w-full text-left px-[10px] py-[9px] rounded-lg hover:bg-surface3 ' +
                  (profileId === p.id ? 'bg-brand-soft' : '')
                }
              >
                <span
                  className="w-7 h-7 rounded-lg grid place-items-center text-[11px] font-extrabold text-white shrink-0"
                  style={{ background: p.color }}
                >
                  {p.initials}
                </span>
                <span className="min-w-0">
                  <span className="block text-[12.5px] font-bold truncate">{p.name}</span>
                  <span className="block text-[11px] text-muted2 truncate">{p.industry}</span>
                </span>
              </button>
            ))}
            <div className="px-[10px] pt-2 pb-1 text-[10.5px] text-muted2 leading-snug border-t border-line2 mt-1">
              Perfiles de demostración con datos ficticios.
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-[10px] py-3 flex flex-col gap-[2px]">
        {visibles.map((m) => {
          const on = ruta === m.id;
          const badge = badges[m.id];
          const t = TONOS[badge?.tone ?? 'grey'];
          return (
            <button
              key={m.id}
              onClick={() => setRuta(m.id)}
              className={
                'flex items-center gap-[11px] w-full text-left px-[11px] py-[9px] rounded-[9px] text-[13.5px] font-semibold ' +
                (on ? 'bg-brand-soft text-brand' : 'text-ink2 hover:bg-surface3')
              }
            >
              <Icon name={m.icon} size={20} />
              <span className="flex-1">{m.label}</span>
              {badge?.value ? (
                <span className="font-mono text-[10.5px] font-semibold px-[6px] py-[2px] rounded-full" style={{ background: t.bg, color: t.fg }}>
                  {badge.value}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      <div className="px-[14px] pt-3 pb-4 border-t border-line2">
        <div className="text-[10.5px] uppercase tracking-[.08em] text-muted2 font-bold mb-[7px]">Rol activo</div>
        <select
          value={rol}
          onChange={(e) => setRol(e.target.value)}
          className="w-full px-[9px] py-2 border border-linestrong rounded-lg bg-surface2 text-[12.5px] font-semibold cursor-pointer"
        >
          {ROLES.map((r) => (
            <option key={r.name} value={r.name}>
              {r.name}
            </option>
          ))}
        </select>
        <div className="mt-2 text-[11px] text-muted3 leading-[1.45]">{ROLES.find((r) => r.name === rol)?.desc}</div>

        <div className="mt-3 pt-3 border-t border-line2 flex items-center gap-[7px] text-[10.5px] font-semibold text-muted2">
          <span className="w-[6px] h-[6px] rounded-full bg-brand" />
          {DEMO_ENV_LABEL}
        </div>
      </div>
    </aside>
  );
}
