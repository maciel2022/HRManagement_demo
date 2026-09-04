import { useEffect, useState } from 'react';
import { useSession } from '@/context/SessionContext';
import { adelantosApi, catalogoApi } from '@/api';
import { Avatar, Card, Chip, DataTable, FormFields, Icon, Modal, ModalFooter } from '@/components/ui';
import { StatCard } from '@/components/ui/Tabs';
import { ars } from '@/lib/format';

const CIRCUITO = ['Empleado', 'Supervisor', 'RRHH', 'Nómina'];

export default function Adelantos({ accion, onAccionConsumida }) {
  const { sucursal, rol, ctx, toastMsg, can } = useSession();
  const [rows, setRows] = useState([]);
  const [nuevo, setNuevo] = useState(false);

  useEffect(() => {
    adelantosApi.list({ sucursal, rol }).then(setRows);
  }, [sucursal, rol]);

  useEffect(() => {
    if (accion?.k === 'nuevoAdelanto') {
      setNuevo(true);
      onAccionConsumida?.();
    }
  }, [accion]);

  const decidir = async (id, estado) => {
    const r = await adelantosApi.decidir(id, estado, ctx);
    if (!r.ok) return toastMsg(r.error);
    setRows(r.adels.filter((a) => rows.some((x) => x.id === a.id)));
    toastMsg('Adelanto ' + id + ': ' + estado.toLowerCase() + '.');
  };

  const kpis = [
    { label: 'Solicitados', value: rows.filter((a) => a.estado === 'Solicitado').length, tone: 'warn' },
    { label: 'En revisión', value: rows.filter((a) => a.estado === 'En revisión').length, tone: 'info' },
    { label: 'Aprobados', value: rows.filter((a) => a.estado === 'Aprobado').length, tone: 'ok' },
    { label: 'Aplicados a liquidación', value: rows.filter((a) => a.estado === 'Aplicado a liquidación').length, tone: 'vio' }
  ];
  const total = rows.reduce((a, x) => a + x.importe, 0);
  const descontado = rows.reduce((a, x) => a + x.descontado, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="card flex items-center gap-[14px] flex-wrap px-[18px] py-[14px]">
        <span className="text-xs font-bold text-ink2">Circuito</span>
        {CIRCUITO.map((c, i) => (
          <span key={c} className="flex items-center gap-[7px]">
            <span className="w-[21px] h-[21px] rounded-full bg-brand-soft text-brand font-mono text-[10.5px] font-extrabold grid place-items-center">
              {i + 1}
            </span>
            <span className="text-xs font-bold">{c}</span>
            <Icon name="chevron_right" size={16} className="text-linestrong" />
          </span>
        ))}
        <div className="flex-1" />
        {can('salary_advances', 'create') && (
          <button className="btn-primary" onClick={() => setNuevo(true)}>
            <Icon name="add" size={18} /> Solicitar adelanto
          </button>
        )}
      </div>

      <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(180px,1fr))]">
        {kpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
        <Card className="px-4">
          <div className="text-[11.5px] font-bold text-muted mb-2">Total solicitado</div>
          <div className="font-mono text-[15px] font-extrabold">{ars(total)}</div>
          <div className="font-mono text-[11.5px] text-muted mt-1">
            Descontado {ars(descontado)} · Saldo {ars(total - descontado)}
          </div>
        </Card>
      </div>

      <div className="card overflow-hidden">
        <DataTable
          rows={rows}
          rowKey={(a) => a.id}
          minWidth={980}
          columns={[
            {
              header: 'Empleado',
              cell: (a) => (
                <div className="flex items-center gap-[10px]">
                  <Avatar emp={a.emp} size={30} />
                  <span>
                    <span className="block font-bold">{a.emp.full}</span>
                    <span className="block text-[10.5px] text-muted2">
                      {a.emp.legajo} · {catalogoApi.corta(a.emp.suc)}
                    </span>
                  </span>
                </div>
              )
            },
            {
              header: 'Solicitud',
              mono: true,
              cell: (a) => (
                <>
                  {a.id}
                  <br />
                  <span className="text-muted2">{a.fecha}</span>
                </>
              )
            },
            { header: 'Importe', align: 'right', mono: true, className: 'font-bold', cell: (a) => ars(a.importe) },
            { header: 'Devolución', mono: true, cell: (a) => ars(a.importe / a.cuotas) + ' × ' + a.cuotas },
            { header: 'Motivo', className: 'text-muted', cell: (a) => a.motivo },
            { header: 'Descontado', align: 'right', mono: true, cell: (a) => ars(a.descontado) },
            { header: 'Saldo', align: 'right', mono: true, className: 'font-bold text-warn', cell: (a) => ars(a.importe - a.descontado) },
            { header: 'Estado', cell: (a) => <Chip estado={a.estado} /> },
            {
              header: '',
              cell: (a) =>
                ['Solicitado', 'En revisión'].includes(a.estado) ? (
                  <div className="flex gap-[6px]">
                    <button
                      onClick={() => decidir(a.id, 'Rechazado')}
                      className="px-[10px] py-[6px] border border-bad-soft rounded-lg bg-surface text-[11.5px] font-bold text-bad hover:bg-bad-soft"
                    >
                      Rechazar
                    </button>
                    <button
                      onClick={() => decidir(a.id, 'Aprobado')}
                      className="px-[10px] py-[6px] rounded-lg bg-brand text-brandink text-[11.5px] font-bold hover:bg-brand-dark"
                    >
                      Aprobar
                    </button>
                  </div>
                ) : null
            }
          ]}
        />
      </div>

      {nuevo && (
        <Modal
          icon="request_quote"
          title="Solicitar adelanto de sueldo"
          subtitle="Sujeto a aprobación de RRHH y tope del 40% del neto"
          width={580}
          onClose={() => setNuevo(false)}
          footer={
            <ModalFooter
              confirmLabel="Enviar solicitud"
              onCancel={() => setNuevo(false)}
              onConfirm={async () => {
                await adelantosApi.create({}, ctx);
                setNuevo(false);
                toastMsg('Adelanto solicitado. Queda pendiente de revisión.');
              }}
            />
          }
        >
          <FormFields
            fields={[
              {
                label: 'Empleado *',
                type: 'select',
                span: true,
                options: catalogoApi.empleadosNombres()
              },
              { label: 'Importe solicitado *', placeholder: '$ 250.000' },
              { label: 'Cuotas de devolución', type: 'select', options: ['1 cuota', '2 cuotas', '3 cuotas'] },
              { label: 'Motivo *', span: true, placeholder: 'Gastos médicos familiares' },
              { label: 'Observaciones', type: 'textarea', span: true }
            ]}
          />
        </Modal>
      )}
    </div>
  );
}
