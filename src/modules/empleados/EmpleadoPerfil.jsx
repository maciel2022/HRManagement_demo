import { useEffect, useState } from 'react';
import { useSession } from '@/context/SessionContext';
import { empleadosApi, nominaApi, catalogoApi } from '@/api';
import {
  Avatar, Card, Chip, DataTable, EmptyState, FormFields, Icon, Modal, ModalFooter, Panel, ProgressBar, Tabs
} from '@/components/ui';
import { TONOS, ars } from '@/lib/format';
import { VE_NOMINA } from '@/lib/permissions';
import ReciboModal from '../nomina/ReciboModal';

const TABS = [
  { id: 'personal', label: 'Información personal' },
  { id: 'laboral', label: 'Información laboral' },
  { id: 'asistencia', label: 'Asistencia' },
  { id: 'vacaciones', label: 'Vacaciones y licencias' },
  { id: 'nomina', label: 'Nómina' },
  { id: 'documentacion', label: 'Documentación' },
  { id: 'desempeno', label: 'Desempeño' },
  { id: 'capacitaciones', label: 'Capacitaciones' }
];

const ACCIONES = [
  { label: 'Editar empleado', icon: 'edit' },
  { label: 'Cambiar sucursal', icon: 'swap_horiz' },
  { label: 'Cambiar puesto', icon: 'badge' },
  { label: 'Cambiar turno', icon: 'schedule' },
  { label: 'Registrar licencia', icon: 'medical_services' },
  { label: 'Cargar documento', icon: 'upload_file' },
  { label: 'Ver historial', icon: 'history' },
  { label: 'Registrar baja', icon: 'person_remove' }
];

function Datos({ items }) {
  return (
    <div className="card p-[22px] grid gap-[18px_26px] [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
      {items.map(([k, v]) => (
        <div key={k}>
          <div className="text-[10.5px] uppercase tracking-[.07em] text-muted2 font-bold mb-[5px]">{k}</div>
          <div className="text-[13.5px] font-semibold">{v}</div>
        </div>
      ))}
    </div>
  );
}

export default function EmpleadoPerfil({ empId, onBack }) {
  const { rol, ctx, toastMsg } = useSession();
  const [emp, setEmp] = useState(null);
  const [det, setDet] = useState(null);
  const [tab, setTab] = useState('personal');
  const [accion, setAccion] = useState(null);
  const [recibo, setRecibo] = useState(null);

  useEffect(() => {
    empleadosApi.get(empId).then((e) => {
      setEmp(e);
      empleadosApi.detalle(e).then(setDet);
    });
  }, [empId]);

  if (!emp || !det) return null;
  const vePago = VE_NOMINA.includes(rol);

  return (
    <div className="flex flex-col gap-4">
      <button className="btn-ghost self-start" onClick={onBack}>
        <Icon name="arrow_back" size={17} /> Volver al directorio
      </button>

      <div className="card p-[22px] flex items-center gap-[18px] flex-wrap">
        <Avatar emp={emp} size={64} radius={16} />
        <div className="min-w-[200px]">
          <div className="flex items-center gap-[10px] mb-[5px]">
            <span className="text-xl font-extrabold tracking-[-.4px]">{emp.full}</span>
            <Chip estado={emp.estado} />
          </div>
          <div className="text-[13px] text-muted font-semibold">
            {emp.puesto} · {emp.area} · {emp.suc}
          </div>
          <div className="font-mono text-[11.5px] text-muted2 mt-[5px]">
            {emp.legajo} · Turno {emp.turno} · Antigüedad {emp.anios} {emp.anios === 1 ? 'año' : 'años'}
          </div>
        </div>
        <div className="flex-1" />
        <div className="flex flex-wrap gap-[7px] max-w-[460px] justify-end">
          {ACCIONES.map((a) => (
            <button
              key={a.label}
              onClick={() => setAccion(a.label)}
              className="flex items-center gap-[6px] px-[11px] py-[7px] border border-[#e2ded6] rounded-[9px] bg-surface text-xs font-bold text-ink2 hover:bg-brand-soft hover:text-brand"
            >
              <Icon name={a.icon} size={16} /> {a.label}
            </button>
          ))}
        </div>
      </div>

      <Tabs tabs={TABS} value={tab} onChange={setTab} />

      {tab === 'personal' && (
        <Datos
          items={[
            ['Nombre', emp.nombre], ['Apellido', emp.apellido], ['DNI', emp.dni], ['CUIL', emp.cuil],
            ['Fecha de nacimiento', emp.nac + ' (' + emp.edad + ' años)'], ['Dirección', emp.dir],
            ['Ciudad', emp.ciudad], ['Provincia', emp.prov], ['Teléfono', emp.tel], ['Email', emp.email],
            ['Contacto de emergencia', emp.emerg]
          ]}
        />
      )}

      {tab === 'laboral' && (
        <Datos
          items={[
            ['Legajo', emp.legajo], ['Fecha de ingreso', emp.ingreso], ['Sucursal', emp.suc + ' — ' + emp.sucDir],
            ['Área', emp.area], ['Puesto', emp.puesto], ['Supervisor', emp.sup], ['Jornada laboral', emp.jornada],
            ['Turno habitual', emp.turno], ['Tipo de contratación', emp.contrato], ['Estado laboral', emp.estado],
            ['Antigüedad', emp.anios + (emp.anios === 1 ? ' año' : ' años')]
          ]}
        />
      )}

      {tab === 'asistencia' && (
        <Panel title="Últimas fichadas">
          <DataTable
            rows={det.asis}
            rowKey={(r) => r.fecha}
            columns={[
              { header: 'Fecha', mono: true, className: 'font-semibold', cell: (r) => r.fecha },
              { header: 'Estado', cell: (r) => <Chip estado={r.estado} /> },
              { header: 'Entrada', mono: true, cell: (r) => r.ent },
              { header: 'Salida', mono: true, cell: (r) => r.sal },
              { header: 'Horas', mono: true, cell: (r) => r.hs },
              { header: 'Extras', mono: true, cell: (r) => r.extra },
              { header: 'Tarde', mono: true, cell: (r) => r.tarde },
              { header: 'Observación', className: 'text-muted', cell: (r) => r.nota }
            ]}
          />
        </Panel>
      )}

      {tab === 'vacaciones' && (
        <div className="flex flex-col gap-4">
          <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(200px,1fr))]">
            {[
              ['Días disponibles', emp.vacDisp, 'ok'],
              ['Días utilizados', emp.vacUsados, 'info'],
              ['Días pendientes', emp.vacPend, 'warn'],
              ['Próximo período', '01/2027', 'grey']
            ].map(([l, v, tone]) => (
              <Card key={l} className="px-[18px]">
                <div className="text-[11.5px] font-bold text-muted mb-2">{l}</div>
                <div
                  className="inline-block font-mono text-2xl font-extrabold px-3 py-[3px] rounded-[9px]"
                  style={{ background: TONOS[tone].bg, color: TONOS[tone].fg }}
                >
                  {v}
                </div>
              </Card>
            ))}
          </div>
          <Panel title="Historial de vacaciones y licencias">
            <DataTable
              rows={det.vacHist}
              rowKey={(r) => r.periodo + r.desde}
              columns={[
                { header: 'Período', className: 'font-bold', cell: (r) => r.periodo },
                { header: 'Desde', mono: true, cell: (r) => r.desde },
                { header: 'Hasta', mono: true, cell: (r) => r.hasta },
                { header: 'Días', mono: true, cell: (r) => r.dias },
                { header: 'Estado', cell: (r) => <Chip estado={r.estado} /> }
              ]}
            />
          </Panel>
        </div>
      )}

      {tab === 'nomina' &&
        (vePago ? (
          <div className="flex flex-col gap-4">
            <div className="card p-[22px] grid gap-[18px] [grid-template-columns:repeat(auto-fill,minmax(180px,1fr))]">
              {[
                ['Sueldo básico', ars(emp.sueldo)],
                ['Horas extra', ars(det.extraAmount)],
                ['Adicional nocturno', ars(det.nightAmount)],
                ['Bruto', ars(det.bruto)],
                ['Aportes y retenciones', '− ' + ars(det.aportes), 'text-bad'],
                ['Neto a cobrar', ars(det.neto), 'text-brand']
              ].map(([l, v, cls]) => (
                <div key={l}>
                  <div className="text-[10.5px] uppercase tracking-[.07em] text-muted2 font-bold mb-[5px]">{l}</div>
                  <div className={'font-mono text-base font-bold ' + (cls ?? '')}>{v}</div>
                </div>
              ))}
            </div>
            <Panel title="Recibos de sueldo">
              {det.recibos.map((r) => (
                <div key={r.periodo} className="px-5 py-[13px] border-t border-canvas flex items-center gap-[14px]">
                  <Icon name="receipt_long" size={20} className="text-brand" />
                  <span className="flex-1 text-[13px] font-bold">{r.periodo}</span>
                  <span className="font-mono text-[12.5px] text-muted">Bruto {ars(r.bruto)}</span>
                  <span className="font-mono text-[12.5px] font-bold">Neto {ars(r.neto)}</span>
                  <Chip estado={r.estado} />
                  <button
                    className="px-[11px] py-[6px] border border-[#e2ded6] rounded-lg bg-surface text-xs font-bold text-brand hover:bg-brand-soft"
                    onClick={() => setRecibo(r.periodo)}
                  >
                    Ver recibo
                  </button>
                </div>
              ))}
            </Panel>
          </div>
        ) : (
          <EmptyState
            icon="lock"
            title="Información salarial restringida"
            body="Tu rol actual no tiene permisos para ver datos de nómina de otros empleados."
          />
        ))}

      {tab === 'documentacion' && (
        <div className="flex flex-col gap-4">
          <Panel title="Documentos del legajo">
            <DataTable
              rows={det.docs}
              rowKey={(d) => d.tipo}
              columns={[
                { header: 'Documento', className: 'font-semibold', cell: (d) => d.tipo },
                { header: 'Carga', mono: true, cell: (d) => d.subida },
                { header: 'Vencimiento', mono: true, cell: (d) => d.vence },
                { header: 'Estado', cell: (d) => <Chip estado={d.estado} /> },
                { header: 'Notas', className: 'text-muted', cell: (d) => d.nota }
              ]}
            />
          </Panel>
          <Panel
            title={
              <span className="flex items-center gap-[9px]">
                <Icon name="health_and_safety" size={19} className="text-warn" /> Uniformes y elementos de protección personal
              </span>
            }
          >
            <DataTable
              rows={det.epp}
              rowKey={(p) => p.item}
              columns={[
                { header: 'Elemento', className: 'font-semibold', cell: (p) => p.item },
                { header: 'Talle', mono: true, cell: (p) => p.talle },
                { header: 'Cantidad', mono: true, cell: (p) => p.cant },
                { header: 'Entrega', mono: true, cell: (p) => p.entrega },
                { header: 'Conformidad', className: 'font-semibold', cell: (p) => p.ack },
                { header: 'Reposición', mono: true, cell: (p) => p.repo }
              ]}
            />
          </Panel>
        </div>
      )}

      {tab === 'desempeno' && (
        <div className="grid gap-4 items-start [grid-template-columns:1.2fr_1fr]">
          <Card className="p-[22px]">
            <div className="flex items-center justify-between mb-[18px]">
              <span className="text-[13.5px] font-bold">Competencias — Evaluación 1° semestre 2026</span>
              <span className="font-mono text-[13px] font-extrabold px-[11px] py-1 rounded-[9px] bg-brand-soft text-brand">
                {det.prom} / 5
              </span>
            </div>
            {det.comps.map((c) => (
              <div key={c.n} className="flex items-center gap-3 mb-[11px]">
                <span className="w-[190px] shrink-0 text-[12.5px] font-semibold">{c.n}</span>
                <ProgressBar pct={c.pct} height={9} />
                <span className="font-mono text-[11.5px] font-bold w-[30px] text-right">{c.label}</span>
              </div>
            ))}
          </Card>
          <div className="flex flex-col gap-4">
            <Card className="p-[22px]">
              <div className="text-[13.5px] font-bold mb-[14px]">Objetivos</div>
              {det.objetivos.map((o) => (
                <div key={o.n} className="mb-[13px]">
                  <div className="flex justify-between gap-[10px] text-[12.5px] font-semibold mb-[6px]">
                    <span>{o.n}</span>
                    <span className="font-mono text-muted">{o.prog}%</span>
                  </div>
                  <ProgressBar pct={o.prog} color="#2f5fa8" height={7} />
                </div>
              ))}
            </Card>
            <Card className="p-[22px]">
              <div className="text-[11px] uppercase tracking-[.07em] text-muted2 font-bold mb-[6px]">Comentario del supervisor</div>
              <div className="text-[13px] leading-[1.55] mb-4 text-pretty">{det.comentarioSup}</div>
              <div className="text-[11px] uppercase tracking-[.07em] text-muted2 font-bold mb-[6px]">Comentario del empleado</div>
              <div className="text-[13px] leading-[1.55] text-pretty">{det.comentarioEmp}</div>
            </Card>
          </div>
        </div>
      )}

      {tab === 'capacitaciones' && (
        <div className="card overflow-hidden">
          <DataTable
            rows={det.caps}
            rowKey={(c) => c.curso}
            columns={[
              { header: 'Curso', className: 'font-semibold', cell: (c) => c.curso },
              { header: 'Obligatorio', cell: (c) => c.obl },
              {
                header: 'Progreso',
                width: 150,
                cell: (c) => (
                  <div className="flex items-center gap-2">
                    <ProgressBar pct={c.prog} height={7} />
                    <span className="font-mono text-[11px] text-muted">{c.prog}%</span>
                  </div>
                )
              },
              { header: 'Estado', cell: (c) => <Chip estado={c.estado} /> },
              { header: 'Finalización', mono: true, cell: (c) => c.fin },
              { header: 'Vence', mono: true, cell: (c) => c.vence },
              { header: 'Certificado', className: 'text-muted', cell: (c) => c.cert }
            ]}
          />
        </div>
      )}

      {accion && (
        <Modal
          icon="edit"
          title={accion}
          subtitle={emp.full + ' · ' + emp.legajo}
          onClose={() => setAccion(null)}
          footer={
            <ModalFooter
              confirmLabel="Guardar cambios"
              onCancel={() => setAccion(null)}
              onConfirm={async () => {
                await empleadosApi.update(emp, accion, ctx);
                toastMsg(accion + ' registrado en el legajo.');
                setAccion(null);
              }}
            />
          }
        >
          <FormFields
            fields={[
              { label: 'Sucursal', type: 'select', options: catalogoApi.sucursalesNombres(), value: emp.suc },
              { label: 'Puesto', type: 'select', options: catalogoApi.puestosNombres(), value: emp.puesto },
              { label: 'Turno', type: 'select', options: catalogoApi.turnosConHorario() },
              { label: 'Vigencia desde', placeholder: '03/09/2026' },
              { label: 'Motivo / observaciones', type: 'textarea', span: true }
            ]}
          />
          <div className="mt-[14px] flex items-center gap-[9px] px-[13px] py-[11px] rounded-[10px] bg-warn-soft text-warn text-xs font-semibold">
            <Icon name="history_edu" size={18} />
            El cambio queda registrado en el historial del legajo con usuario y fecha.
          </div>
        </Modal>
      )}

      {recibo && (
        <ReciboModal
          emp={emp}
          periodo={recibo}
          onClose={() => setRecibo(null)}
          onConfirm={async () => {
            await nominaApi.exportarRecibo(emp, ctx);
            setRecibo(null);
            toastMsg('Recibo descargado (PDF simulado).');
          }}
        />
      )}
    </div>
  );
}
