import { useState } from 'react';
import { useSession } from '@/context/SessionContext';
import { adminApi } from '@/api';
import { Card, Chip, DataTable, EmptyState, Icon, Panel, Tabs } from '@/components/ui';
import { HABILIDAD_LABEL, HABILIDADES, abilities } from '@/lib/permissions';
import { TONOS, ars } from '@/lib/format';

const TABS = [
  { id: 'sucursales', label: 'Sucursales' },
  { id: 'areas', label: 'Áreas' },
  { id: 'puestos', label: 'Puestos' },
  { id: 'turnos', label: 'Turnos' },
  { id: 'licencias', label: 'Tipos de licencia' },
  { id: 'feriados', label: 'Feriados' },
  { id: 'usuarios', label: 'Usuarios y permisos' },
  { id: 'modelo', label: 'Modelo de datos' }
];

const MODULOS_PERM = ['Empleados', 'Asistencia', 'Turnos', 'Licencias', 'Nómina', 'Adelantos', 'Reportes', 'Configuración'];
const NIVEL = {
  0: { t: 'Sin acceso', bg: '#f6f5f2', fg: '#a5a29a' },
  1: { t: 'Total', ...TONOS.ok },
  2: { t: 'Su sucursal', ...TONOS.info },
  3: { t: 'Propio', ...TONOS.vio }
};
const MATRIZ = [
  ['Administrador', [1, 1, 1, 1, 1, 1, 1, 1]],
  ['Recursos Humanos', [1, 1, 1, 1, 1, 1, 1, 0]],
  ['Gerencia', [1, 1, 1, 1, 1, 1, 1, 0]],
  ['Encargado de sucursal', [2, 1, 1, 2, 0, 2, 2, 0]],
  ['Supervisor', [2, 2, 1, 2, 0, 0, 2, 0]],
  ['Empleado', [3, 3, 3, 3, 3, 3, 0, 0]]
];

export default function Administracion() {
  const { rol, ctx, toastMsg } = useSession();
  const [tab, setTab] = useState('sucursales');
  const auditoria = adminApi.auditoria();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-[10px] flex-wrap">
        <Tabs tabs={TABS} value={tab} onChange={setTab} />
        <div className="flex-1" />
        <button
          className="btn-primary"
          onClick={async () => {
            await adminApi.create(tab, ctx);
            toastMsg('Registro creado en la configuración.');
          }}
        >
          <Icon name="add" size={18} /> Nuevo registro
        </button>
      </div>

      {tab === 'sucursales' && (
        <div className="grid gap-[14px] [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
          {adminApi.sucursales().map((s) => (
            <Card key={s.id} className="px-[19px]">
              <div className="flex items-center gap-[10px] mb-[11px]">
                <span className="w-8 h-8 rounded-[9px] bg-brand-soft text-brand grid place-items-center">
                  <Icon name="local_gas_station" size={18} />
                </span>
                <span className="flex-1 text-[13.5px] font-bold">{s.name}</span>
                <Chip estado="Activo" />
              </div>
              <div className="text-[12.5px] text-muted leading-[1.6]">
                {s.address}, {s.city}
                <br />
                {s.province}
              </div>
              <div className="mt-3 pt-[11px] border-t border-canvas grid grid-cols-2 gap-[10px]">
                <div>
                  <div className="text-[10.5px] uppercase text-muted2 font-bold">Dotación</div>
                  <div className="font-mono text-sm font-bold">{adminApi.dotacionPorSucursal(s.name)}</div>
                </div>
                <div>
                  <div className="text-[10.5px] uppercase text-muted2 font-bold">Operación</div>
                  <div className="text-[12.5px] font-semibold">{s.opening_hours}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-[10.5px] uppercase text-muted2 font-bold">Encargado</div>
                  <div className="text-[12.5px] font-semibold">{s.manager_name}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'areas' && (
        <div className="card overflow-hidden">
          <DataTable
            rows={adminApi.areas()}
            rowKey={(a) => a.id}
            columns={[
              { header: 'Área', className: 'font-bold', cell: (a) => a.name },
              { header: 'Puestos', className: 'text-muted', cell: (a) => adminApi.puestosDeArea(a.name).join(' · ') },
              { header: 'Dotación', mono: true, className: 'font-bold', cell: (a) => adminApi.dotacionPorArea(a.name) },
              { header: 'Centro de costo', mono: true, cell: (a) => a.cost_center },
              { header: 'Responsable', cell: (a) => (a.name === 'Gerencia' ? 'Dirección' : 'Encargado de estación') }
            ]}
          />
        </div>
      )}

      {tab === 'puestos' && (
        <div className="card overflow-hidden">
          <DataTable
            rows={adminApi.puestos()}
            rowKey={(p) => p.id}
            columns={[
              { header: 'Puesto', className: 'font-bold', cell: (p) => p.name },
              { header: 'Área', cell: (p) => adminApi.areas().find((a) => a.id === p.department_id)?.name },
              { header: 'Ocupantes', mono: true, cell: (p) => adminApi.dotacionPorPuesto(p.name) },
              { header: 'Encuadre', className: 'text-muted', cell: (p) => p.agreement },
              { header: 'Rango salarial de referencia', mono: true, cell: (p) => ars(p.salary_min) + ' – ' + ars(p.salary_max) }
            ]}
          />
        </div>
      )}

      {tab === 'turnos' && (
        <div className="card overflow-hidden">
          <DataTable
            rows={adminApi.turnos()}
            rowKey={(t) => t.id}
            columns={[
              { header: 'Turno', className: 'font-bold', cell: (t) => t.name },
              { header: 'Horario', mono: true, cell: (t) => (t.start_time ? t.start_time + ' – ' + t.end_time : 'Ciclo 6×2') },
              { header: 'Tolerancia', mono: true, cell: (t) => t.tolerance_min + ' min' },
              { header: 'Nocturnidad', cell: (t) => (t.is_night ? 'Sí — adicional 8%' : t.rotating ? 'Según ciclo' : 'No') },
              { header: 'Asignados', mono: true, className: 'font-bold', cell: (t) => adminApi.dotacionPorTurno(t.name) }
            ]}
          />
        </div>
      )}

      {tab === 'licencias' && (
        <div className="card overflow-hidden">
          <div className="px-5 py-[13px] bg-warn-soft text-warn text-xs font-semibold">
            Las políticas de días y topes son configurables por el administrador según el convenio y la normativa
            aplicable a la empresa.
          </div>
          <DataTable
            rows={adminApi.tiposLicencia()}
            rowKey={(l) => l.id}
            columns={[
              { header: 'Tipo de licencia', className: 'font-bold', cell: (l) => l.name },
              { header: 'Remunerada', cell: (l) => (l.is_paid ? 'Sí' : 'No') },
              { header: 'Requiere certificado', cell: (l) => (l.requires_certificate ? 'Sí' : 'No') },
              { header: 'Tope', className: 'text-muted', cell: (l) => l.cap },
              { header: 'Aprobación', cell: (l) => (l.approval_flow === 'supervisor,hr' ? 'Supervisor + RRHH' : 'RRHH') }
            ]}
          />
        </div>
      )}

      {tab === 'feriados' && (
        <div className="card overflow-hidden">
          <DataTable
            rows={adminApi.feriados()}
            rowKey={(f) => f.id}
            columns={[
              { header: 'Fecha', mono: true, className: 'font-bold', cell: (f) => f.label },
              { header: 'Denominación', className: 'font-semibold', cell: (f) => f.name },
              { header: 'Tipo', cell: (f) => <Chip estado={f.scope === 'national' ? 'Nacional' : 'De la empresa'} /> },
              { header: 'Recargo', cell: (f) => 'Al ' + f.surcharge_pct + '%' }
            ]}
          />
        </div>
      )}

      {tab === 'usuarios' && (
        <div className="flex flex-col gap-4">
          <Panel title="Usuarios del sistema">
            <DataTable
              rows={adminApi.usuarios()}
              rowKey={(u) => u.id}
              columns={[
                { header: 'Nombre', className: 'font-bold', cell: (u) => u.full_name },
                { header: 'Usuario', mono: true, className: 'text-muted', cell: (u) => u.username },
                { header: 'Rol', className: 'font-semibold', cell: (u) => u.role_name },
                { header: 'Alcance', cell: (u) => u.scope_label },
                { header: 'Último acceso', mono: true, cell: (u) => u.last_login },
                { header: 'Estado', cell: () => <Chip estado="Activo" /> }
              ]}
            />
          </Panel>
          <Panel title="Matriz de permisos por rol">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-[#faf9f7]">
                    <th className="th pl-5">Rol</th>
                    {MODULOS_PERM.map((m) => (
                      <th key={m} className="th text-center">
                        {m}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MATRIZ.map(([r, cells]) => (
                    <tr key={r} className="border-t border-canvas">
                      <td className="td pl-5 font-bold whitespace-nowrap">{r}</td>
                      {cells.map((v, i) => (
                        <td key={i} className="px-2 py-[7px] text-center">
                          <span className="chip" style={{ background: NIVEL[v].bg, color: NIVEL[v].fg }}>
                            {NIVEL[v].t}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      )}

      {tab === 'modelo' && (
        <div className="flex flex-col gap-4">
          <Panel
            title="Entidades del sistema"
            subtitle={'Cada módulo lee de estas tablas normalizadas. La última columna muestra las operaciones habilitadas para el rol ' + rol + '.'}
          >
            <DataTable
              rows={adminApi.modelo(rol)}
              rowKey={(r) => r.key}
              minWidth={1100}
              columns={[
                { header: 'Entidad', className: 'font-bold', cell: (r) => r.l },
                { header: 'Tabla', mono: true, className: 'text-brand', cell: (r) => r.t },
                { header: 'PK', mono: true, className: 'text-muted', cell: (r) => r.pk },
                { header: 'Claves foráneas', mono: true, className: 'text-muted text-[11.5px]', cell: (r) => r.fk },
                { header: 'Registros', mono: true, className: 'font-bold', cell: (r) => r.registros },
                {
                  header: 'Permitido a tu rol',
                  width: 330,
                  cell: (r) => (
                    <div className="flex flex-wrap gap-[5px]">
                      {r.abilities.length ? (
                        HABILIDADES.filter((h) => r.abilities.includes(h)).map((h) => (
                          <span key={h} className="chip" style={{ background: TONOS.ok.bg, color: TONOS.ok.fg }}>
                            {HABILIDAD_LABEL[h]}
                          </span>
                        ))
                      ) : (
                        <span className="chip" style={{ background: '#f6f5f2', color: '#a5a29a' }}>
                          Sin acceso
                        </span>
                      )}
                    </div>
                  )
                }
              ]}
            />
          </Panel>

          <div className="grid gap-4 items-start [grid-template-columns:1.2fr_1fr]">
            <Panel title="Registro de operaciones de esta sesión">
              {auditoria.length ? (
                auditoria.slice(0, 12).map((a) => {
                  const t =
                    a.op === 'create' ? TONOS.ok : a.op === 'approve' ? TONOS.brand : a.op === 'reject' ? TONOS.bad : a.op === 'export' ? TONOS.vio : TONOS.info;
                  return (
                    <div key={a.id} className="px-5 py-[11px] border-t border-canvas flex items-center gap-[11px] flex-wrap">
                      <span className="chip font-mono" style={{ background: t.bg, color: t.fg }}>
                        {a.op}
                      </span>
                      <span className="font-mono text-[11.5px] text-brand">{a.entity}</span>
                      <span className="font-mono text-[11.5px] text-muted">{a.ref}</span>
                      <span className="flex-1 text-xs text-ink2">{a.detail}</span>
                      <span className="font-mono text-[11px] text-muted2">
                        {a.rol} · {a.at}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="p-9">
                  <EmptyState
                    icon="history"
                    title="Sin operaciones registradas todavía"
                    body="Aprobá una licencia o un adelanto y la operación aparece acá con su entidad y referencia."
                  />
                </div>
              )}
            </Panel>

            <Panel title="Lotes de importación">
              {adminApi.lotes().map((b) => (
                <div key={b.id} className="px-5 py-[13px] border-t border-canvas">
                  <div className="flex items-center gap-[10px] mb-[6px]">
                    <span className="font-mono text-[11.5px] font-bold">BATCH-{b.id}</span>
                    <span className="flex-1 text-[12.5px] font-bold">{b.source}</span>
                    <Chip estado="Aprobado">{b.status}</Chip>
                  </div>
                  <div className="font-mono text-[11.5px] text-muted leading-[1.6]">
                    {b.file_name}
                    <br />
                    {b.rows} filas · {b.created_incidents} incidencias · {b.imported_at}
                  </div>
                </div>
              ))}
              <div className="px-5 py-[14px] border-t border-canvas text-xs text-muted leading-[1.6] text-pretty">
                Las fichadas importadas quedan asociadas al lote (<span className="font-mono">import_batch_id</span>), de
                modo que una importación puede revertirse sin afectar los registros cargados manualmente.
              </div>
            </Panel>
          </div>
        </div>
      )}
    </div>
  );
}
