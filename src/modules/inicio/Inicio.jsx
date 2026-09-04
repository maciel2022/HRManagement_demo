import { useEffect, useMemo, useState } from 'react';
import { useSession } from '@/context/SessionContext';
import { dashboardApi, adminApi, catalogoApi, capacitacionesApi, documentosApi } from '@/api';
import { getDb } from '@/data/database';
import { useConfig } from '@/config/ConfigContext';
import { KpiCard } from '@/components/ui/Tabs';
import { Avatar, BarList, Card, ColumnChart, FilterBar, Icon, Panel, Select } from '@/components/ui';
import { TONOS, pct } from '@/lib/format';

const TENDENCIAS = {
  presentismo: [
    { label: '28/07', value: 91 }, { label: '04/08', value: 93 }, { label: '11/08', value: 89 },
    { label: '18/08', value: 94 }, { label: '25/08', value: 92 }, { label: '01/09', value: 95 }
  ],
  ausentismo: [
    { label: 'Abr', value: 6.2 }, { label: 'May', value: 5.4 }, { label: 'Jun', value: 7.1 },
    { label: 'Jul', value: 6.8 }, { label: 'Ago', value: 5.9 }, { label: 'Sep', value: 4.8 }
  ],
  extras: [
    { label: 'Abr', value: 412 }, { label: 'May', value: 388 }, { label: 'Jun', value: 465 },
    { label: 'Jul', value: 501 }, { label: 'Ago', value: 448 }, { label: 'Sep', value: 126 }
  ],
  rotacion: [
    { label: 'Abr', value: 3.1 }, { label: 'May', value: 2.4 }, { label: 'Jun', value: 4.0 },
    { label: 'Jul', value: 2.8 }, { label: 'Ago', value: 3.4 }, { label: 'Sep', value: 1.6 }
  ]
};

const LICENCIAS = [
  { label: 'Vacaciones', value: 11 }, { label: 'Enfermedad', value: 8 }, { label: 'Licencia médica', value: 5 },
  { label: 'Estudio', value: 3 }, { label: 'Familiar', value: 2 }, { label: 'Otras', value: 3 }
];

export default function Inicio() {
  const { sucursal, rol, filtros, setFiltros, resetFiltros, setRuta, toastMsg } = useSession();
  const { catalogo } = useConfig();
  const [data, setData] = useState(null);
  const db = getDb();

  useEffect(() => {
    dashboardApi.resumen({ sucursal, rol, ...filtros }).then(setData);
  }, [sucursal, rol, filtros]);

  const areasOpt = useMemo(() => ['Todas', ...catalogoApi.areasNombres()], [db]);
  const puestosOpt = useMemo(() => ['Todos', ...catalogoApi.puestosNombres()], [db]);

  if (!data) return null;
  const { base } = data;

  const kpis = [
    { label: 'Total de empleados', value: data.total, sub: 'Dotación activa', icon: 'groups', tone: 'brand' },
    { label: 'Presentes hoy', value: data.presentes, sub: pct(data.presentes, data.total) + '% de la dotación', icon: 'how_to_reg', tone: 'ok' },
    { label: 'Ausentes', value: data.ausentes, sub: data.ausentes + ' sin justificar', icon: 'person_off', tone: 'bad' },
    { label: 'Llegadas tarde', value: data.tarde, sub: 'Tolerancia: 10 min', icon: 'running_with_errors', tone: 'warn' },
    { label: 'De franco', value: data.franco, sub: 'Descanso programado', icon: 'weekend', tone: 'grey' },
    { label: 'De vacaciones', value: data.vacaciones, sub: 'Período 2026', icon: 'beach_access', tone: 'info' },
    { label: 'Con licencia', value: data.licencia, sub: 'Médicas y especiales', icon: 'medical_services', tone: 'vio' },
    { label: 'Turnos activos', value: data.turnosActivos, sub: catalogoApi.turnosNombres().filter((t) => t !== 'Rotativo').join(' · '), icon: 'calendar_view_week', tone: 'brand' },
    { label: 'Solicitudes pendientes', value: data.solicitudesPendientes, sub: 'Vacaciones y licencias', icon: 'pending_actions', tone: 'warn' },
    { label: 'Adelantos pendientes', value: data.adelantosPendientes, sub: 'A revisar antes del cierre', icon: 'request_quote', tone: 'warn' },
    { label: 'Documentación por vencer', value: data.docsPorVencer, sub: 'Próximos 30 días', icon: 'folder_shared', tone: 'bad' },
    { label: 'Cumpleaños del mes', value: data.cumples.length, sub: 'Septiembre 2026', icon: 'cake', tone: 'vio' }
  ];

  const alertas = [
    { icon: 'assignment_late', tone: 'bad', title: 'Certificado médico pendiente', body: db.emps[7].full + ' — licencia del 01/09 sin certificado adjunto (48 h de plazo).', cta: 'Revisar licencia', ruta: 'vacaciones' },
    { icon: 'folder_shared', tone: 'bad', title: 'Documento próximo a vencer', body: documentosApi.documentoCritico() + ' de ' + db.emps[19].full + ' vence el 21/09/2026.', cta: 'Ver documentación', ruta: 'documentacion' },
    { icon: 'running_with_errors', tone: 'warn', title: 'Reiteradas llegadas tarde', body: db.emps[12].full + ' acumula 3 llegadas tarde en los últimos 7 días (turno Mañana).', cta: 'Ver asistencia', ruta: 'asistencia' },
    { icon: 'beach_access', tone: 'warn', title: 'Licencia esperando aprobación', body: '2 licencias médicas en etapa RRHH desde hace más de 3 días.', cta: 'Aprobar', ruta: 'vacaciones' },
    { icon: 'event_busy', tone: 'info', title: 'Vacaciones superpuestas', body: db.branches[3].name + ': 3 solicitudes coinciden entre el 14/09 y el 21/09.', cta: 'Ver calendario', ruta: 'vacaciones' },
    { icon: 'request_quote', tone: 'warn', title: 'Adelanto de sueldo solicitado', body: db.emps[23].full + ' solicitó $ 250.000 en 2 cuotas.', cta: 'Revisar adelanto', ruta: 'adelantos' },
    { icon: 'school', tone: 'bad', title: 'Capacitación obligatoria pendiente', body: '9 empleados sin completar “' + capacitacionesApi.cursoCritico() + '”.', cta: 'Ver capacitaciones', ruta: 'capacitaciones' },
    { icon: 'sync_problem', tone: 'bad', title: 'Incidencias de fichadas sin resolver', body: data.incidencias + ' incidencias del período 01/09 al 03/09 requieren revisión manual.', cta: 'Resolver', ruta: 'asistencia' }
  ];

  return (
    <div className="flex flex-col gap-[18px]">
      <FilterBar
        right={
          <button
            className="btn-ghost"
            onClick={() => {
              resetFiltros();
              toastMsg('Filtros restablecidos');
            }}
          >
            Limpiar
          </button>
        }
      >
        <span className="text-xs font-bold text-ink2 mr-1">Filtros</span>
        <Select value={filtros.area} onChange={(v) => setFiltros({ area: v })} options={areasOpt} prefix="Área" />
        <Select value={filtros.puesto} onChange={(v) => setFiltros({ puesto: v })} options={puestosOpt} prefix="Puesto" />
        <Select value={filtros.estado} onChange={(v) => setFiltros({ estado: v })} options={['Todos', 'Activo', 'Vacaciones', 'Licencia', 'Baja']} prefix="Estado" />
        <div className="px-[10px] py-[7px] border border-dashed border-linestrong rounded-lg text-[12.5px] font-semibold text-muted font-mono">
          Fecha: 03/09/2026
        </div>
      </FilterBar>

      <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(212px,1fr))]">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <div className="grid gap-4 items-start [grid-template-columns:1.35fr_1fr]">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Card className="px-[18px]">
              <div className="text-[13px] font-bold mb-[14px]">Empleados por sucursal</div>
              <BarList
                labelWidth={96}
                items={db.branches.map((b) => ({
                  label: b.name.replace(catalogo.unidad + ' ', ''),
                  value: adminApi.dotacionPorSucursal(b.name)
                }))}
              />
            </Card>
            <Card className="px-[18px]">
              <div className="text-[13px] font-bold mb-[14px]">Empleados por área</div>
              <BarList
                labelWidth={108}
                color="var(--info-fg)"
                items={catalogoApi.areasNombres().map((a) => ({ label: a, value: base.filter((e) => e.area === a).length }))}
              />
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ColumnChart title="Presentismo semanal" subtitle="% de asistencia sobre dotación" items={TENDENCIAS.presentismo} />
            <ColumnChart title="Ausentismo mensual" subtitle="% de jornadas no trabajadas" items={TENDENCIAS.ausentismo} color="var(--bad-fg)" />
            <ColumnChart title="Horas extra" subtitle="Total de horas al 50% y 100%" items={TENDENCIAS.extras} color="var(--warn-fg)" />
            <ColumnChart title="Rotación de personal" subtitle="% mensual de altas y bajas" items={TENDENCIAS.rotacion} color="var(--vio-fg)" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="px-[18px]">
              <div className="text-[13px] font-bold mb-[14px]">Empleados por turno</div>
              <BarList
                labelWidth={68}
                color="var(--vio-fg)"
                items={catalogoApi.turnosNombres().map((t) => ({
                  label: t,
                  value: base.filter((e) => e.turno === t).length
                }))}
              />
            </Card>
            <Card className="px-[18px]">
              <div className="text-[13px] font-bold mb-[14px]">Distribución de licencias</div>
              <BarList labelWidth={96} color="var(--warn-fg)" items={LICENCIAS} />
            </Card>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Panel
            title={
              <span className="flex items-center gap-[9px]">
                <Icon name="warning" size={20} className="text-bad" /> Centro de alertas
              </span>
            }
            right={<span className="chip font-mono" style={{ background: TONOS.bad.bg, color: TONOS.bad.fg }}>{alertas.length} activas</span>}
          >
            {alertas.map((a) => {
              const t = TONOS[a.tone];
              return (
                <div key={a.title} className="px-[18px] py-[13px] border-b border-canvas flex gap-[11px]">
                  <span className="w-[30px] h-[30px] shrink-0 rounded-[9px] grid place-items-center" style={{ background: t.bg, color: t.fg }}>
                    <Icon name={a.icon} size={17} />
                  </span>
                  <div className="min-w-0">
                    <div className="text-[12.5px] font-bold mb-[3px]">{a.title}</div>
                    <div className="text-xs text-muted leading-[1.5] text-pretty">{a.body}</div>
                    <button
                      onClick={() => setRuta(a.ruta)}
                      className="mt-[7px] px-[10px] py-[5px] border border-linestrong rounded-[7px] bg-surface text-[11.5px] font-bold text-brand hover:bg-brand-soft"
                    >
                      {a.cta}
                    </button>
                  </div>
                </div>
              );
            })}
          </Panel>

          <Card className="px-[18px]">
            <div className="flex items-center gap-[9px] mb-[14px]">
              <Icon name="cake" size={19} className="text-vio" />
              <span className="text-[13px] font-bold">Cumpleaños de septiembre</span>
            </div>
            {data.cumples.slice(0, 6).map((e) => (
              <div key={e.id} className="flex items-center gap-[10px] py-[7px] border-b border-canvas">
                <Avatar emp={e} />
                <span className="flex-1 min-w-0">
                  <span className="block text-[12.5px] font-bold">{e.full}</span>
                  <span className="block text-[11px] text-muted3">
                    {e.puesto} · {e.suc.replace(catalogo.unidad + ' ', '')}
                  </span>
                </span>
                <span className="font-mono text-[11.5px] font-semibold text-vio">
                  {String(e.nacDia).padStart(2, '0')}/09
                </span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
