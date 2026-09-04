import { useEffect, useState } from 'react';
import { useSession } from '@/context/SessionContext';
import { reportesApi, catalogoApi } from '@/api';
import { DataTable, Icon, Panel } from '@/components/ui';

const REPORTES = [
  { n: 'Asistencia mensual', d: 'Presentismo por empleado, sucursal y turno', i: 'fact_check' },
  { n: 'Llegadas tarde', d: 'Minutos acumulados y reincidencias', i: 'running_with_errors' },
  { n: 'Ausentismo', d: 'Faltas justificadas e injustificadas', i: 'person_off' },
  { n: 'Horas extra', d: 'Horas al 50% y 100% por período', i: 'more_time' },
  { n: 'Vacaciones', d: 'Días tomados, pendientes y proyección', i: 'beach_access' },
  { n: 'Licencias', d: 'Por tipo, duración y sucursal', i: 'medical_services' },
  { n: 'Dotación por sucursal', d: 'Headcount por área y puesto', i: 'store' },
  { n: 'Altas y bajas', d: 'Movimientos del período', i: 'swap_vert' },
  { n: 'Antigüedad', d: 'Distribución por tramos', i: 'workspace_premium' },
  { n: 'Nómina mensual', d: 'Bruto, descuentos y neto por empleado', i: 'payments' },
  { n: 'Adelantos', d: 'Solicitudes, aprobados y saldos', i: 'request_quote' },
  { n: 'Documentación pendiente', d: 'Vencidos y próximos a vencer', i: 'folder_off' },
  { n: 'Capacitaciones', d: 'Cumplimiento y certificados', i: 'school' },
  { n: 'Cumpleaños', d: 'Listado mensual', i: 'cake' },
  { n: 'Rotación de personal', d: 'Índice mensual y por sucursal', i: 'sync' }
];

export default function Reportes() {
  const { sucursal, rol, filtros, ctx, toastMsg } = useSession();
  const [sel, setSel] = useState(REPORTES[0].n);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    reportesApi.datos({ sucursal, rol }).then(setRows);
  }, [sucursal, rol]);

  const exportar = async (formato) => {
    await reportesApi.exportar(sel, formato, ctx);
    toastMsg('Reporte “' + sel + '” exportado a ' + formato + ' (simulado).');
  };

  const chips = [
    ['Sucursal', sucursal],
    ['Área', filtros.area],
    ['Puesto', filtros.puesto],
    ['Período', '01/08/2026 – 31/08/2026'],
    ['Estado', filtros.estado],
    ['Turno', filtros.turno]
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(230px,1fr))]">
        {REPORTES.map((r) => (
          <button
            key={r.n}
            onClick={() => setSel(r.n)}
            className="text-left rounded-[13px] px-4 py-[15px] flex gap-[11px] items-start hover:bg-[#faf9f7]"
            style={{ border: '1.5px solid ' + (sel === r.n ? '#12665c' : '#e6e3dd'), background: sel === r.n ? '#faf9f7' : '#fff' }}
          >
            <span className="w-8 h-8 shrink-0 rounded-[9px] grid place-items-center bg-brand-soft text-brand">
              <Icon name={r.i} size={18} />
            </span>
            <span>
              <span className="block text-[12.5px] font-bold mb-[3px]">{r.n}</span>
              <span className="block text-[11.5px] text-muted leading-tight">{r.d}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-[17px] border-b border-line2">
          <div className="flex items-center gap-3 flex-wrap mb-[14px]">
            <div>
              <div className="text-[14.5px] font-extrabold">{sel}</div>
              <div className="text-xs text-muted">{REPORTES.find((r) => r.n === sel)?.d}</div>
            </div>
            <div className="flex-1" />
            <button className="btn-ghost" onClick={() => exportar('CSV')}>
              <Icon name="description" size={17} /> Exportar CSV
            </button>
            <button className="btn-ghost" onClick={() => exportar('Excel')}>
              <Icon name="table_view" size={17} /> Exportar Excel
            </button>
            <button className="btn-primary" onClick={() => exportar('PDF')}>
              <Icon name="picture_as_pdf" size={17} /> Exportar PDF
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {chips.map(([l, v]) => (
              <span key={l} className="flex items-center gap-[6px] px-[11px] py-[6px] border border-[#e2ded6] rounded-full bg-[#faf9f7] text-[11.5px]">
                <span className="font-bold text-[#8b8880]">{l}:</span>
                <span className="font-bold">{v}</span>
              </span>
            ))}
          </div>
        </div>

        <DataTable
          rows={rows}
          rowKey={(e) => e.id}
          columns={[
            { header: 'Empleado', className: 'font-bold', cell: (e) => e.full },
            { header: 'Legajo', mono: true, className: 'text-muted', cell: (e) => e.legajo },
            { header: 'Sucursal', cell: (e) => catalogoApi.corta(e.suc) },
            { header: 'Área', cell: (e) => e.area },
            { header: 'Turno', cell: (e) => e.turno },
            { header: 'Presentes', mono: true, cell: (e) => 17 + (e.id % 6) },
            { header: 'Tarde', mono: true, cell: (e) => e.id % 5 },
            { header: 'Ausentes', mono: true, cell: (e) => e.id % 4 },
            { header: 'Horas extra', mono: true, cell: (e) => (e.extras ?? 0) + ':00' }
          ]}
        />
      </div>
    </div>
  );
}
