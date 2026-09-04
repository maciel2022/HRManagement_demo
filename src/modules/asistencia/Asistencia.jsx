import { useEffect, useMemo, useState } from 'react';
import { useSession } from '@/context/SessionContext';
import { asistenciaApi, catalogoApi } from '@/api';
import { Avatar, Card, Chip, DataTable, EmptyState, Icon, Panel, Tabs } from '@/components/ui';
import { StatCard } from '@/components/ui/Tabs';
import { detalleDe } from '@/data/database';
import { TONOS, tono } from '@/lib/format';
import HikvisionWizard from './HikvisionWizard';

const TABS = [
  { id: 'diario', label: 'Vista diaria' },
  { id: 'mensual', label: 'Calendario mensual' },
  { id: 'incidencias', label: 'Incidencias de fichadas' }
];

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const LEYENDA = ['Presente', 'Tarde', 'Ausente', 'Franco', 'Vacaciones', 'Licencia', 'Feriado'];

// Septiembre 2026 arranca martes ⇒ 1 celda vacía antes del día 1.
function calendario(emp) {
  const det = detalleDe(emp);
  const previos = {};
  det.asis.forEach((a) => {
    previos[parseInt(a.fecha.slice(0, 2), 10)] = a.estado;
  });
  const cells = [{ dia: '', estado: '' }];
  for (let d = 1; d <= 30; d++) {
    const dow = d % 7; // 5 = sábado, 6 = domingo
    let estado = previos[d];
    if (!estado) {
      const semilla = (emp.id * 31 + d * 7) % 100;
      estado =
        dow === 5 || dow === 6
          ? semilla < 50
            ? 'Franco'
            : 'Presente'
          : semilla < 62
          ? 'Presente'
          : semilla < 72
          ? 'Tarde'
          : semilla < 79
          ? 'Franco'
          : semilla < 85
          ? 'Vacaciones'
          : semilla < 90
          ? 'Licencia'
          : semilla < 95
          ? 'Ausente'
          : 'Presente';
    }
    cells.push({ dia: String(d), estado, hoy: d === 3 });
  }
  return cells;
}

export default function Asistencia({ accion, onAccionConsumida }) {
  const { sucursal, rol, ctx, toastMsg, setRuta } = useSession();
  const [tab, setTab] = useState('diario');
  const [rows, setRows] = useState([]);
  const [incs, setIncs] = useState([]);
  const [legajo, setLegajo] = useState(null);
  const [wizard, setWizard] = useState(false);

  useEffect(() => {
    asistenciaApi.delDia({ sucursal, rol }).then((r) => {
      setRows(r);
      setLegajo((l) => l ?? r[0]?.legajo ?? null);
    });
    asistenciaApi.incidencias().then(setIncs);
  }, [sucursal, rol]);

  useEffect(() => {
    if (accion?.k === 'importar') {
      setWizard(true);
      onAccionConsumida?.();
    }
  }, [accion]);

  const emp = useMemo(() => rows.find((e) => e.legajo === legajo) ?? rows[0], [rows, legajo]);
  const cells = emp ? calendario(emp) : [];

  const resumen = [
    { label: 'Presentes', value: rows.filter((e) => e.hoy === 'Presente').length, tone: 'ok' },
    { label: 'Tarde', value: rows.filter((e) => e.hoy === 'Tarde').length, tone: 'warn' },
    { label: 'Ausentes', value: rows.filter((e) => e.hoy === 'Ausente').length, tone: 'bad' },
    { label: 'Francos', value: rows.filter((e) => e.hoy === 'Franco').length, tone: 'grey' },
    { label: 'Vacaciones', value: rows.filter((e) => e.hoy === 'Vacaciones').length, tone: 'info' },
    { label: 'Licencias', value: rows.filter((e) => e.hoy === 'Licencia').length, tone: 'vio' },
    { label: 'Horas extra hoy', value: rows.reduce((a, e) => a + (e.extras || 0), 0), tone: 'warn' },
    { label: 'Sin fichada de salida', value: rows.filter((e) => e.salida === '—' && e.entrada !== '—').length, tone: 'bad' }
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-[10px] flex-wrap">
        <Tabs tabs={TABS} value={tab} onChange={setTab} />
        <div className="flex-1" />
        <button className="btn-primary" onClick={() => setWizard(true)}>
          <Icon name="upload_file" size={18} /> Importar fichadas Hikvision
        </button>
      </div>

      {tab === 'diario' && (
        <div className="flex flex-col gap-4">
          <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(160px,1fr))]">
            {resumen.map((r) => (
              <StatCard key={r.label} {...r} />
            ))}
          </div>
          <Panel title="Fichadas del 03/09/2026">
            <DataTable
              rows={rows}
              rowKey={(e) => e.id}
              minWidth={1100}
              onRowClick={() => setRuta('empleados')}
              columns={[
                {
                  header: 'Empleado',
                  cell: (e) => (
                    <div className="flex items-center gap-[10px]">
                      <Avatar emp={e} size={30} />
                      <span>
                        <span className="block font-bold">{e.full}</span>
                        <span className="block font-mono text-[10.5px] text-muted2">
                          {e.legajo} · {e.area}
                        </span>
                      </span>
                    </div>
                  )
                },
                { header: 'Sucursal', cell: (e) => catalogoApi.corta(e.suc) },
                { header: 'Turno', cell: (e) => e.turno },
                { header: 'Entrada', mono: true, cell: (e) => e.entrada },
                { header: 'Salida', mono: true, cell: (e) => e.salida },
                { header: 'Horas', mono: true, cell: (e) => (e.hs ? e.hs + ':00' : '—') },
                { header: 'Extras', mono: true, cell: (e) => (e.extras ? e.extras + ':00' : '—') },
                { header: 'Tarde', mono: true, cell: (e) => (e.tardeMin ? e.tardeMin + ' min' : '—') },
                { header: 'Estado', cell: (e) => <Chip estado={e.hoy} /> },
                {
                  header: 'Observación',
                  className: 'text-muted',
                  cell: (e) =>
                    e.salida === '—' && e.entrada !== '—'
                      ? 'Falta fichada de salida'
                      : e.hoy === 'Ausente'
                      ? 'Sin justificar'
                      : '—'
                }
              ]}
            />
          </Panel>
        </div>
      )}

      {tab === 'mensual' && emp && (
        <div className="grid gap-4 items-start [grid-template-columns:1.6fr_1fr]">
          <Card className="p-[22px]">
            <div className="flex items-center gap-3 mb-[18px] flex-wrap">
              <span className="text-sm font-bold">Septiembre 2026</span>
              <div className="flex-1" />
              <select
                value={emp.legajo}
                onChange={(e) => setLegajo(e.target.value)}
                className="px-[10px] py-2 border border-[#e2ded6] rounded-[9px] bg-[#faf9f7] text-[12.5px] font-semibold cursor-pointer max-w-[300px]"
              >
                {rows.map((e) => (
                  <option key={e.id} value={e.legajo}>
                    {e.legajo} — {e.full}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-7 gap-[7px]">
              {DIAS.map((d) => (
                <div key={d} className="text-center text-[10.5px] uppercase tracking-[.06em] text-muted2 font-bold pb-1">
                  {d}
                </div>
              ))}
              {cells.map((c, i) => {
                const t = c.estado ? tono(c.estado) : { bg: 'transparent', fg: 'transparent' };
                return (
                  <div
                    key={i}
                    className="min-h-[64px] rounded-[10px] p-2"
                    style={{ background: t.bg, border: '1.5px solid ' + (c.hoy ? '#12665c' : 'transparent') }}
                  >
                    <div className="font-mono text-xs font-bold mb-1" style={{ color: t.fg }}>
                      {c.dia}
                    </div>
                    <div className="text-[10.5px] font-bold leading-tight" style={{ color: t.fg }}>
                      {c.estado}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
          <div className="flex flex-col gap-4">
            <Card className="px-5">
              <div className="text-[13px] font-bold mb-[13px]">Referencias</div>
              <div className="flex flex-wrap gap-[7px]">
                {LEYENDA.map((l) => (
                  <Chip key={l} estado={l} />
                ))}
              </div>
            </Card>
            <Card className="px-5">
              <div className="text-[13px] font-bold mb-[10px]">Cómo se calcula</div>
              <div className="text-[12.5px] text-muted leading-[1.6] text-pretty">
                Las horas trabajadas, extras, llegadas tarde y salidas anticipadas se calculan automáticamente al
                importar las fichadas del dispositivo Hikvision, comparando cada lectura contra el turno asignado y la
                tolerancia configurada.
              </div>
            </Card>
          </div>
        </div>
      )}

      {tab === 'incidencias' &&
        (incs.length ? (
          <div className="flex flex-col gap-3">
            {incs.map((i) => (
              <div key={i.id} className="card px-[18px] py-[15px] flex items-center gap-[14px] flex-wrap">
                <Avatar emp={i.emp} size={34} radius={10} />
                <div className="min-w-[200px]">
                  <div className="text-[13px] font-bold">{i.emp.full}</div>
                  <div className="font-mono text-[11px] text-muted2">
                    {i.id} · {i.emp.legajo} · {i.fecha}
                  </div>
                </div>
                <div className="min-w-[220px] flex-1">
                  <Chip tone={TONOS[i.tone]}>{i.tipo}</Chip>
                  <div className="text-xs text-muted mt-[5px]">{i.det}</div>
                </div>
                <div className="font-mono text-[11.5px] text-[#8b8880] min-w-[150px]">
                  {i.disp}
                  <br />
                  {i.punto}
                </div>
                <div className="flex gap-[7px]">
                  <button
                    className="btn-ghost"
                    onClick={async () => {
                      const r = await asistenciaApi.resolverIncidencia(i.id, 'excuse', ctx);
                      setIncs(r);
                      toastMsg('Incidencia ' + i.id + ' justificada y registrada.');
                    }}
                  >
                    Justificar
                  </button>
                  <button
                    className="btn-primary"
                    onClick={async () => {
                      const r = await asistenciaApi.resolverIncidencia(i.id, 'fix', ctx);
                      setIncs(r);
                      toastMsg('Incidencia ' + i.id + ' corregida y registrada.');
                    }}
                  >
                    Corregir fichada
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="task_alt"
            tone="#1f7a4d"
            title="No hay incidencias pendientes"
            body="Todas las fichadas del período fueron revisadas."
          />
        ))}

      {wizard && (
        <HikvisionWizard
          onClose={() => setWizard(false)}
          onConfirm={async () => {
            await asistenciaApi.importar('AccessControl_0109-0209.csv', ctx);
            setWizard(false);
            toastMsg('Importación confirmada: 248 fichadas procesadas, 11 incidencias generadas.');
          }}
        />
      )}
    </div>
  );
}
