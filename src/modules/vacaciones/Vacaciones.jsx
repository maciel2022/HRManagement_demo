import { useEffect, useState } from 'react';
import { useSession } from '@/context/SessionContext';
import { licenciasApi, catalogoApi } from '@/api';
import { Avatar, Card, Chip, DataTable, FormFields, Icon, Modal, ModalFooter, Panel, ProgressBar, Tabs } from '@/components/ui';
import { StatCard } from '@/components/ui/Tabs';
import { TIPOS_LICENCIA } from '@/data/catalogos';
import { getDb } from '@/data/database';
import { TONOS } from '@/lib/format';

const TABS = [
  { id: 'solicitudes', label: 'Solicitudes' },
  { id: 'saldos', label: 'Saldos por empleado' },
  { id: 'calendario', label: 'Calendario del equipo' }
];

const SOLAPES = (db) => [
  { icon: 'event_busy', tone: 'bad', l: 'Superposición detectada', d: db.branches[3].name + ': 3 solicitudes de vacaciones coinciden entre el 14/09 y el 21/09. Quedaría 1 persona por turno.' },
  { icon: 'groups', tone: 'warn', l: 'Dotación mínima en riesgo', d: db.branches[2].name + ': con las licencias aprobadas, el turno nocturno del 12/09 queda con 2 personas.' }
];

export default function Vacaciones({ accion, onAccionConsumida }) {
  const { sucursal, rol, ctx, toastMsg, can } = useSession();
  const [tab, setTab] = useState('solicitudes');
  const [reqs, setReqs] = useState([]);
  const [saldos, setSaldos] = useState([]);
  const [nueva, setNueva] = useState(false);

  const cargar = () => {
    licenciasApi.list({ sucursal, rol }).then(setReqs);
    licenciasApi.saldos({ sucursal, rol }).then(setSaldos);
  };

  useEffect(cargar, [sucursal, rol]);

  useEffect(() => {
    if (accion?.k === 'nuevaLicencia') {
      setNueva(true);
      onAccionConsumida?.();
    }
  }, [accion]);

  const decidir = async (id, estado) => {
    const r = await licenciasApi.decidir(id, estado, ctx);
    if (!r.ok) return toastMsg(r.error);
    setReqs(r.reqs.filter((x) => reqs.some((y) => y.id === x.id)));
    toastMsg('Solicitud ' + id + ': ' + estado.toLowerCase() + '.');
  };

  const kpis = [
    { label: 'Pendientes', value: reqs.filter((r) => r.estado === 'Pendiente').length, tone: 'warn' },
    { label: 'En revisión RRHH', value: reqs.filter((r) => r.estado === 'En revisión').length, tone: 'info' },
    { label: 'Aprobadas', value: reqs.filter((r) => r.estado === 'Aprobado').length, tone: 'ok' },
    { label: 'Rechazadas', value: reqs.filter((r) => r.estado === 'Rechazado').length, tone: 'bad' },
    { label: 'Días solicitados', value: reqs.reduce((a, r) => a + r.dias, 0), tone: 'grey' }
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-[10px] flex-wrap">
        <Tabs tabs={TABS} value={tab} onChange={setTab} />
        <div className="flex-1" />
        {can('leave_requests', 'create') && (
          <button className="btn-primary" onClick={() => setNueva(true)}>
            <Icon name="add" size={18} /> Nueva solicitud
          </button>
        )}
      </div>

      <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(170px,1fr))]">
        {kpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      {tab === 'solicitudes' && (
        <div className="flex flex-col gap-3">
          {reqs.map((r) => (
            <div key={r.id} className="card px-[18px] py-4">
              <div className="flex items-center gap-[14px] flex-wrap">
                <Avatar emp={r.emp} size={34} radius={10} />
                <div className="min-w-[190px]">
                  <div className="text-[13px] font-bold">{r.emp.full}</div>
                  <div className="font-mono text-[11px] text-muted2">
                    {r.id} · {catalogoApi.corta(r.emp.suc)} · solicitado {r.solicitado}
                  </div>
                </div>
                <div className="min-w-[150px]">
                  <div className="text-[10.5px] uppercase tracking-[.06em] text-muted2 font-bold">Tipo</div>
                  <div className="text-[12.5px] font-bold">{r.tipo}</div>
                </div>
                <div className="min-w-[170px]">
                  <div className="text-[10.5px] uppercase tracking-[.06em] text-muted2 font-bold">Período</div>
                  <div className="font-mono text-[12.5px]">
                    {r.desde} → {r.hasta} · {r.dias} d
                  </div>
                </div>
                <div className="min-w-[110px]">
                  <div className="text-[10.5px] uppercase tracking-[.06em] text-muted2 font-bold">Etapa</div>
                  <div className="text-[12.5px] font-bold">{r.etapa}</div>
                </div>
                <div className="flex-1" />
                <Chip estado={r.estado} />
                {['Pendiente', 'En revisión'].includes(r.estado) && (
                  <div className="flex gap-[7px]">
                    <button
                      onClick={() => decidir(r.id, 'Rechazado')}
                      className="px-3 py-[7px] border border-badline rounded-lg bg-surface text-xs font-bold text-bad hover:bg-bad-soft"
                    >
                      Rechazar
                    </button>
                    <button onClick={() => decidir(r.id, 'Aprobado')} className="btn-primary">
                      Aprobar
                    </button>
                  </div>
                )}
              </div>
              <div className="mt-[11px] pt-[11px] border-t border-canvas flex gap-6 flex-wrap text-xs text-muted">
                <span>
                  <b className="text-ink2">Motivo:</b> {r.motivo}
                </span>
                <span>
                  <b className="text-ink2">Observaciones:</b> {r.obs}
                </span>
                <span>
                  <b className="text-ink2">Adjunto:</b> {r.adjunto ?? 'Sin adjunto'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'saldos' && (
        <div className="card overflow-hidden">
          <DataTable
            rows={saldos}
            rowKey={(e) => e.id}
            columns={[
              {
                header: 'Empleado',
                cell: (e) => (
                  <div className="flex items-center gap-[10px]">
                    <Avatar emp={e} size={30} />
                    <span>
                      <span className="block font-bold">{e.full}</span>
                      <span className="block font-mono text-[10.5px] text-muted2">{e.legajo}</span>
                    </span>
                  </div>
                )
              },
              { header: 'Sucursal', cell: (e) => catalogoApi.corta(e.suc) },
              { header: 'Antigüedad', cell: (e) => e.anios + ' años' },
              { header: 'Disponibles', mono: true, className: 'font-bold', cell: (e) => e.vacDisp },
              { header: 'Utilizados', mono: true, cell: (e) => e.vacUsados },
              { header: 'Pendientes', mono: true, className: 'font-bold text-warn', cell: (e) => e.vacPend },
              {
                header: 'Uso',
                width: 130,
                cell: (e) => <ProgressBar pct={Math.round((e.vacUsados / e.vacDisp) * 100)} color="var(--info-fg)" height={7} />
              },
              { header: 'Próximo período', mono: true, cell: () => '01/01/2027' }
            ]}
          />
        </div>
      )}

      {tab === 'calendario' && (
        <div className="flex flex-col gap-4">
          <Card className="p-[22px] overflow-x-auto">
            <div className="text-[13.5px] font-bold mb-4">Ausencias previstas — Septiembre 2026</div>
            <div className="min-w-[760px]">
              <div className="flex gap-[10px] mb-2">
                <span className="w-[190px] shrink-0" />
                <span className="flex-1 flex">
                  {Array.from({ length: 30 }, (_, i) => (
                    <span key={i} className="flex-1 text-center font-mono text-[9.5px] text-muted2">
                      {i + 1}
                    </span>
                  ))}
                </span>
              </div>
              {reqs
                .filter((r) => !['Rechazado', 'Cancelado'].includes(r.estado))
                .slice(0, 14)
                .map((r) => {
                  const ini = parseInt(r.desde.slice(0, 2), 10);
                  const t = r.tipo === 'Vacaciones' ? TONOS.info : TONOS.vio;
                  return (
                    <div key={r.id} className="flex gap-[10px] items-center mb-[7px]">
                      <span className="w-[190px] shrink-0">
                        <span className="block text-xs font-bold">{r.emp.full}</span>
                        <span className="block text-[10.5px] text-muted2">{catalogoApi.corta(r.emp.suc)}</span>
                      </span>
                      <span className="flex-1 relative h-[26px] bg-surface2 rounded-[7px]">
                        <span
                          className="absolute top-[3px] bottom-[3px] rounded-md text-[10px] font-bold grid place-items-center overflow-hidden whitespace-nowrap px-1"
                          style={{
                            left: Math.round(((ini - 1) / 30) * 100) + '%',
                            width: Math.max(4, Math.round((r.dias / 30) * 100)) + '%',
                            background: t.bg,
                            color: t.fg
                          }}
                        >
                          {r.tipo} · {r.dias} d
                        </span>
                      </span>
                    </div>
                  );
                })}
            </div>
          </Card>
          <div className="grid grid-cols-2 gap-[14px]">
            {SOLAPES(getDb()).map((s) => (
              <Card key={s.l} className="px-[18px] flex gap-3">
                <span className="w-8 h-8 shrink-0 rounded-[9px] grid place-items-center" style={{ background: TONOS[s.tone].bg, color: TONOS[s.tone].fg }}>
                  <Icon name={s.icon} size={18} />
                </span>
                <div>
                  <div className="text-[13px] font-bold mb-1">{s.l}</div>
                  <div className="text-xs text-muted leading-[1.5] text-pretty">{s.d}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {nueva && (
        <Modal
          icon="beach_access"
          title="Nueva solicitud de licencia"
          subtitle="Se enviará al supervisor de tu sucursal"
          width={620}
          onClose={() => setNueva(false)}
          footer={
            <ModalFooter
              confirmLabel="Enviar solicitud"
              onCancel={() => setNueva(false)}
              onConfirm={async () => {
                await licenciasApi.create({}, ctx);
                setNueva(false);
                toastMsg('Solicitud enviada al supervisor.');
              }}
            />
          }
        >
          <FormFields
            fields={[
              { label: 'Tipo *', type: 'select', span: true, options: TIPOS_LICENCIA },
              { label: 'Fecha desde *', placeholder: '14/09/2026' },
              { label: 'Fecha hasta *', placeholder: '20/09/2026' },
              { label: 'Cantidad de días', value: '7', readOnly: true },
              { label: 'Documento adjunto', placeholder: 'Adjuntar certificado (PDF)', dashed: true },
              { label: 'Motivo *', span: true, placeholder: 'Descanso anual programado' },
              { label: 'Observaciones', type: 'textarea', span: true, placeholder: 'Cobertura coordinada con…' }
            ]}
          />
          <div className="mt-[14px] flex items-center gap-[9px] px-[13px] py-[11px] rounded-[10px] bg-info-soft text-info text-xs font-semibold">
            <Icon name="route" size={18} />
            Circuito de aprobación: Empleado → Supervisor → RRHH → Aprobado / Rechazado
          </div>
        </Modal>
      )}
    </div>
  );
}
