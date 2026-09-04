import { useEffect, useState } from 'react';
import { useSession } from '@/context/SessionContext';
import { nominaApi, catalogoApi } from '@/api';
import { Avatar, Chip, DataTable, EmptyState, Panel } from '@/components/ui';
import { StatCard } from '@/components/ui/Tabs';
import { VE_NOMINA } from '@/lib/permissions';
import { ars } from '@/lib/format';
import ReciboModal from './ReciboModal';

export default function Nomina() {
  const { rol, sucursal, ctx, toastMsg } = useSession();
  const [periodo, setPeriodo] = useState(null);
  const [rows, setRows] = useState([]);
  const [recibo, setRecibo] = useState(null);
  const vePago = VE_NOMINA.includes(rol);
  const periodos = nominaApi.periodos();

  useEffect(() => {
    if (vePago) nominaApi.liquidacion({ sucursal, rol }).then(setRows);
  }, [sucursal, rol, vePago]);

  if (!vePago) {
    return (
      <EmptyState
        icon="lock"
        title="Acceso restringido a la nómina"
        body="Con tu rol podés ver únicamente tus propios recibos de sueldo desde tu legajo."
      />
    );
  }

  const bruto = rows.reduce((a, r) => a + r.detalle.bruto, 0);
  const kpis = [
    { label: 'Empleados liquidados', value: rows.length, tone: 'brand' },
    { label: 'Total bruto', value: ars(bruto), tone: 'info' },
    { label: 'Aportes y contribuciones', value: ars(bruto * 0.17), tone: 'bad' },
    { label: 'Total neto', value: ars(bruto * 0.83), tone: 'ok' },
    { label: 'Horas extra liquidadas', value: '448 h', tone: 'warn' },
    { label: 'Adelantos descontados', value: ars(1250000), tone: 'vio' }
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]">
        {kpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))]">
        {periodos.map((p) => (
          <button
            key={p.id}
            onClick={() => setPeriodo(p.name)}
            className="text-left bg-surface rounded-[13px] px-4 py-[15px] hover:bg-surface2"
            style={{ border: '1.5px solid ' + (periodo === p.name ? 'var(--brand)' : 'var(--line)') }}
          >
            <div className="flex items-center justify-between gap-[10px] mb-[9px]">
              <span className="text-[13px] font-bold">{p.name}</span>
              <Chip estado={p.status} />
            </div>
            <div className="font-mono text-[11.5px] text-muted3">
              {p.employees} empleados · pago {p.payment_date}
            </div>
          </button>
        ))}
      </div>

      {!periodo ? (
        <EmptyState
          icon="payments"
          title="Seleccioná un período para ver el detalle"
          body="Podés abrir cada recibo individual desde el listado de empleados del período."
        />
      ) : (
        <Panel
          title={periodo}
          right={
            <button
              className="btn-primary"
              onClick={async () => {
                await nominaApi.cerrar(periodo, ctx);
                toastMsg('Liquidación enviada a aprobación de Gerencia.');
              }}
            >
              Enviar a aprobación
            </button>
          }
        >
          <DataTable
            rows={rows}
            rowKey={(r) => r.emp.id}
            minWidth={1000}
            columns={[
              {
                header: 'Empleado',
                cell: ({ emp }) => (
                  <div className="flex items-center gap-[10px]">
                    <Avatar emp={emp} size={30} />
                    <span>
                      <span className="block font-bold">{emp.full}</span>
                      <span className="block text-[10.5px] text-muted2">{emp.puesto}</span>
                    </span>
                  </div>
                )
              },
              { header: 'Sucursal', cell: ({ emp }) => catalogoApi.corta(emp.suc) },
              { header: 'Básico', align: 'right', mono: true, cell: ({ emp }) => ars(emp.sueldo) },
              { header: 'Extras', align: 'right', mono: true, cell: ({ detalle }) => ars(detalle.extraAmount) },
              { header: 'Nocturnidad', align: 'right', mono: true, cell: ({ detalle }) => ars(detalle.nightAmount) },
              { header: 'Bonos', align: 'right', mono: true, cell: ({ emp }) => ars(emp.sueldo * 0.0833) },
              { header: 'Adelantos', align: 'right', mono: true, className: 'text-warn', cell: ({ adelantos }) => ars(adelantos) },
              { header: 'Bruto', align: 'right', mono: true, className: 'font-bold', cell: ({ detalle }) => ars(detalle.bruto) },
              { header: 'Descuentos', align: 'right', mono: true, className: 'text-bad', cell: ({ detalle }) => '− ' + ars(detalle.aportes) },
              { header: 'Neto', align: 'right', mono: true, className: 'font-extrabold text-brand', cell: ({ detalle }) => ars(detalle.neto) },
              {
                header: '',
                cell: ({ emp }) => (
                  <button
                    className="px-[11px] py-[6px] border border-linestrong rounded-lg bg-surface text-xs font-bold text-brand hover:bg-brand-soft whitespace-nowrap"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      setRecibo(emp);
                    }}
                  >
                    Recibo
                  </button>
                )
              }
            ]}
          />
        </Panel>
      )}

      {recibo && (
        <ReciboModal
          emp={recibo}
          periodo={(periodo ?? 'Agosto 2026').replace('Liquidación ', '')}
          onClose={() => setRecibo(null)}
          onConfirm={async () => {
            await nominaApi.exportarRecibo(recibo, ctx);
            setRecibo(null);
            toastMsg('Recibo descargado (PDF simulado).');
          }}
        />
      )}
    </div>
  );
}
