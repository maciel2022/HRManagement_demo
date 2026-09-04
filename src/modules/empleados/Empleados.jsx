import { useEffect, useMemo, useState } from 'react';
import { useSession } from '@/context/SessionContext';
import { empleadosApi, catalogoApi } from '@/api';
import { Avatar, Chip, DataTable, FilterBar, FormFields, Icon, Modal, ModalFooter, Select } from '@/components/ui';
import EmpleadoPerfil from './EmpleadoPerfil';

export default function Empleados({ accion, onAccionConsumida }) {
  const { sucursal, rol, q, filtros, setFiltros, resetFiltros, ctx, toastMsg, can } = useSession();
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [empId, setEmpId] = useState(null);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    empleadosApi.list({ sucursal, rol, ...filtros, q }).then(setRows);
    empleadosApi.list({ sucursal, rol }).then((r) => setTotal(r.length));
  }, [sucursal, rol, filtros, q]);

  useEffect(() => {
    if (accion?.k === 'nuevoEmpleado') {
      setModal('nuevo');
      onAccionConsumida?.();
    }
  }, [accion]);

  const areasOpt = useMemo(() => ['Todas', ...catalogoApi.areasNombres()], [sucursal]);
  const puestosOpt = useMemo(() => ['Todos', ...catalogoApi.puestosNombres()], [sucursal]);
  const turnosOpt = useMemo(() => ['Todos', ...catalogoApi.turnosNombres()], [sucursal]);

  if (empId !== null) {
    return <EmpleadoPerfil empId={empId} onBack={() => setEmpId(null)} />;
  }

  const columns = [
    {
      header: 'Empleado',
      cell: (e) => (
        <div className="flex items-center gap-[10px]">
          <Avatar emp={e} />
          <span className="font-bold">{e.full}</span>
        </div>
      )
    },
    { header: 'Legajo', mono: true, className: 'text-muted', cell: (e) => e.legajo },
    { header: 'DNI', mono: true, className: 'text-muted', cell: (e) => e.dni },
    { header: 'Sucursal', cell: (e) => catalogoApi.corta(e.suc) },
    { header: 'Área', cell: (e) => e.area },
    { header: 'Puesto', cell: (e) => e.puesto },
    { header: 'Turno', cell: (e) => e.turno },
    { header: 'Ingreso', mono: true, className: 'text-muted', cell: (e) => e.ingreso },
    { header: 'Contratación', className: 'text-muted', cell: (e) => e.contrato },
    { header: 'Estado', cell: (e) => <Chip estado={e.estado} /> },
    { header: 'Supervisor', className: 'text-muted', cell: (e) => e.sup }
  ];

  return (
    <div className="flex flex-col gap-4">
      <FilterBar
        right={
          <>
            <span className="font-mono text-xs text-[#8b8880]">
              {rows.length} de {total} empleados
            </span>
            {can('employees', 'create') && (
              <button className="btn-primary" onClick={() => setModal('nuevo')}>
                <Icon name="person_add" size={17} /> Nuevo empleado
              </button>
            )}
          </>
        }
      >
        <Select value={filtros.area} onChange={(v) => setFiltros({ area: v })} options={areasOpt} prefix="Área" />
        <Select value={filtros.puesto} onChange={(v) => setFiltros({ puesto: v })} options={puestosOpt} prefix="Puesto" />
        <Select value={filtros.turno} onChange={(v) => setFiltros({ turno: v })} options={turnosOpt} prefix="Turno" />
        <Select value={filtros.estado} onChange={(v) => setFiltros({ estado: v })} options={['Todos', 'Activo', 'Vacaciones', 'Licencia', 'Baja']} prefix="Estado" />
        <button
          className="btn-ghost"
          onClick={() => {
            resetFiltros();
            toastMsg('Filtros restablecidos');
          }}
        >
          Limpiar
        </button>
      </FilterBar>

      <div className="card overflow-hidden">
        <DataTable columns={columns} rows={rows} rowKey={(e) => e.id} onRowClick={(e) => setEmpId(e.id)} minWidth={1200} />
      </div>

      {modal === 'nuevo' && (
        <Modal
          icon="person_add"
          title="Nuevo empleado"
          subtitle="Alta de legajo — los campos marcados son obligatorios"
          width={720}
          onClose={() => setModal(null)}
          footer={
            <ModalFooter
              confirmLabel="Crear empleado"
              onCancel={() => setModal(null)}
              onConfirm={async () => {
                await empleadosApi.create({}, ctx);
                setModal(null);
                toastMsg('Empleado creado. Legajo L-1200 asignado.');
              }}
            />
          }
        >
          <FormFields
            fields={[
              { label: 'Nombre *', placeholder: 'Ej.: Lucía' },
              { label: 'Apellido *', placeholder: 'Ej.: Peralta' },
              { label: 'DNI *', placeholder: '30.123.456' },
              { label: 'CUIL *', placeholder: '20-30123456-3' },
              { label: 'Fecha de ingreso *', placeholder: '03/09/2026' },
              { label: 'Sucursal *', type: 'select', options: catalogoApi.sucursalesNombres() },
              { label: 'Área *', type: 'select', options: catalogoApi.areasNombres() },
              { label: 'Puesto *', type: 'select', options: catalogoApi.puestosNombres() },
              { label: 'Turno habitual', type: 'select', options: catalogoApi.turnosConHorario() },
              { label: 'Tipo de contratación', type: 'select', options: ['Tiempo indeterminado', 'Plazo fijo', 'Eventual', 'Pasantía'] },
              { label: 'Observaciones', type: 'textarea', span: true, placeholder: 'Datos adicionales del legajo' }
            ]}
          />
        </Modal>
      )}
    </div>
  );
}
