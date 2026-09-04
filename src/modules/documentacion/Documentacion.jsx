import { useEffect, useState } from 'react';
import { useSession } from '@/context/SessionContext';
import { documentosApi, catalogoApi } from '@/api';
import { Avatar, Chip, DataTable, Icon, Modal, ModalFooter, FormFields } from '@/components/ui';
import { StatCard } from '@/components/ui/Tabs';

const FILTROS = ['Todos', 'Vigente', 'Próximo a vencer', 'Vencido', 'Pendiente'];

export default function Documentacion() {
  const { sucursal, rol, ctx, toastMsg, setRuta, can } = useSession();
  const [filtro, setFiltro] = useState('Todos');
  const [rows, setRows] = useState([]);
  const [todas, setTodas] = useState([]);
  const [cargar, setCargar] = useState(false);

  useEffect(() => {
    documentosApi.list({ sucursal, rol, estado: filtro }).then(setRows);
    documentosApi.list({ sucursal, rol }).then(setTodas);
  }, [sucursal, rol, filtro]);

  const cnt = (st) => todas.filter((r) => r.estado === st).length;
  const kpis = [
    { label: 'Vigentes', value: cnt('Vigente'), tone: 'ok' },
    { label: 'Próximos a vencer', value: cnt('Próximo a vencer'), tone: 'warn' },
    { label: 'Vencidos', value: cnt('Vencido'), tone: 'bad' },
    { label: 'Pendientes de carga', value: cnt('Pendiente'), tone: 'info' }
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(190px,1fr))]">
        {kpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      <div className="card flex items-center gap-2 flex-wrap px-[15px] py-3">
        {FILTROS.map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={
              'px-[13px] py-[7px] border border-linestrong rounded-full text-xs font-bold ' +
              (filtro === f ? 'bg-brand text-brandink' : 'bg-surface text-ink2 hover:bg-surface3')
            }
          >
            {f}
          </button>
        ))}
        <div className="flex-1" />
        <span className="font-mono text-xs text-muted3">{rows.length} documentos</span>
        {can('documents', 'create') && (
          <button className="btn-primary" onClick={() => setCargar(true)}>
            <Icon name="upload_file" size={17} /> Cargar documento
          </button>
        )}
      </div>

      <div className="card overflow-hidden">
        <DataTable
          rows={rows.slice(0, 40)}
          rowKey={(r, i) => r.emp.id + '-' + r.tipo + '-' + i}
          onRowClick={() => setRuta('empleados')}
          columns={[
            {
              header: 'Empleado',
              cell: (r) => (
                <div className="flex items-center gap-[10px]">
                  <Avatar emp={r.emp} size={30} />
                  <span>
                    <span className="block font-bold">{r.emp.full}</span>
                    <span className="block font-mono text-[10.5px] text-muted2">{r.emp.legajo}</span>
                  </span>
                </div>
              )
            },
            { header: 'Sucursal', cell: (r) => catalogoApi.corta(r.emp.suc) },
            { header: 'Documento', className: 'font-semibold', cell: (r) => r.tipo },
            { header: 'Carga', mono: true, cell: (r) => r.subida },
            { header: 'Vencimiento', mono: true, cell: (r) => r.vence },
            { header: 'Estado', cell: (r) => <Chip estado={r.estado} /> },
            { header: 'Notas', className: 'text-muted', cell: (r) => r.nota }
          ]}
        />
      </div>

      {cargar && (
        <Modal
          icon="upload_file"
          title="Cargar documento"
          subtitle="Queda asociado al legajo del empleado"
          onClose={() => setCargar(false)}
          footer={
            <ModalFooter
              confirmLabel="Cargar documento"
              onCancel={() => setCargar(false)}
              onConfirm={async () => {
                await documentosApi.upload(rows[0]?.emp, ctx);
                setCargar(false);
                toastMsg('Documento cargado al legajo.');
              }}
            />
          }
        >
          <FormFields
            fields={[
              { label: 'Tipo de documento', type: 'select', span: true, options: catalogoApi.tiposDocumentoNombres() },
              { label: 'Fecha de carga', placeholder: '03/09/2026' },
              { label: 'Vencimiento', placeholder: '03/09/2027' },
              { label: 'Archivo', span: true, dashed: true, placeholder: 'Adjuntar PDF o imagen' },
              { label: 'Notas', type: 'textarea', span: true }
            ]}
          />
        </Modal>
      )}
    </div>
  );
}
