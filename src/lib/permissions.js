// Matriz de permisos por rol. Espeja lo que después serán Policies de Laravel
// + un Global Scope por data_scope.

export const ENTIDADES = {
  branches: { l: 'Sucursales', t: 'branches', pk: 'id', fk: 'manager_employee_id → employees.id', ops: 'CRUD' },
  departments: { l: 'Áreas', t: 'departments', pk: 'id', fk: '—', ops: 'CRUD' },
  positions: { l: 'Puestos', t: 'positions', pk: 'id', fk: 'department_id → departments.id', ops: 'CRUD' },
  shifts: { l: 'Turnos', t: 'shifts', pk: 'id', fk: '—', ops: 'CRUD' },
  employees: { l: 'Empleados', t: 'employees', pk: 'id', fk: 'branch_id, department_id, position_id, shift_id, supervisor_employee_id', ops: 'CRUD' },
  attendance_records: { l: 'Registros de asistencia', t: 'attendance_records', pk: 'id', fk: 'employee_id, shift_id, import_batch_id', ops: 'CRU · Import' },
  attendance_incidents: { l: 'Incidencias de fichadas', t: 'attendance_incidents', pk: 'id', fk: 'employee_id, resolved_by_user_id', ops: 'RU · Resolver' },
  leave_types: { l: 'Tipos de licencia', t: 'leave_types', pk: 'id', fk: '—', ops: 'CRUD' },
  leave_requests: { l: 'Solicitudes de licencia', t: 'leave_requests', pk: 'id', fk: 'employee_id, leave_type_id, approved_by_user_id', ops: 'CRUD · Aprobar / Rechazar' },
  leave_balances: { l: 'Saldos de licencia', t: 'leave_balances', pk: 'id', fk: 'employee_id', ops: 'RU' },
  payroll_periods: { l: 'Períodos de liquidación', t: 'payroll_periods', pk: 'id', fk: '—', ops: 'CRUD · Cerrar' },
  payslips: { l: 'Recibos de sueldo', t: 'payslips', pk: 'id', fk: 'payroll_period_id, employee_id', ops: 'CR · Export' },
  salary_advances: { l: 'Adelantos de sueldo', t: 'salary_advances', pk: 'id', fk: 'employee_id, payroll_period_id', ops: 'CRUD · Aprobar / Rechazar' },
  documents: { l: 'Documentos', t: 'documents', pk: 'id', fk: 'employee_id, document_type_id', ops: 'CRUD' },
  trainings: { l: 'Capacitaciones', t: 'trainings', pk: 'id', fk: '—', ops: 'CRUD' },
  training_records: { l: 'Registros de capacitación', t: 'training_records', pk: 'id', fk: 'employee_id, training_id', ops: 'CRUD' },
  performance_reviews: { l: 'Evaluaciones de desempeño', t: 'performance_reviews', pk: 'id', fk: 'employee_id, reviewer_employee_id', ops: 'CRUD' },
  equipment_issues: { l: 'Entregas de uniforme y EPP', t: 'equipment_issues', pk: 'id', fk: 'employee_id, equipment_item_id', ops: 'CRUD' },
  announcements: { l: 'Anuncios', t: 'announcements', pk: 'id', fk: 'author_user_id', ops: 'CRUD' },
  holidays: { l: 'Feriados', t: 'holidays', pk: 'id', fk: '—', ops: 'CRUD' },
  users: { l: 'Usuarios', t: 'users', pk: 'id', fk: 'role_id, branch_id, employee_id', ops: 'CRUD' },
  role_permissions: { l: 'Roles y permisos', t: 'roles', pk: 'id', fk: 'role_id', ops: 'RU' }
};

export const HABILIDADES = ['create', 'read', 'update', 'delete', 'approve', 'reject', 'import', 'export'];

export const HABILIDAD_LABEL = {
  create: 'Crear', read: 'Ver', update: 'Editar', delete: 'Eliminar',
  approve: 'Aprobar', reject: 'Rechazar', import: 'Importar', export: 'Exportar'
};

const CRUD = ['create', 'read', 'update', 'delete'];

export function abilities(rol, entidad) {
  if (rol === 'Administrador') return [...CRUD, 'approve', 'reject', 'import', 'export'];
  if (rol === 'Recursos Humanos')
    return entidad === 'users' || entidad === 'role_permissions'
      ? ['read']
      : [...CRUD, 'approve', 'reject', 'import', 'export'];
  if (rol === 'Gerencia')
    return ['read', 'export'].concat(
      entidad === 'leave_requests' || entidad === 'salary_advances' ? ['approve', 'reject'] : []
    );
  if (rol === 'Encargado de sucursal')
    return ['leave_requests','salary_advances','attendance_incidents','attendance_records','training_records','performance_reviews','documents'].includes(entidad)
      ? ['create', 'read', 'update', 'approve', 'reject', 'export']
      : ['read'];
  if (rol === 'Supervisor')
    return ['leave_requests', 'attendance_records', 'attendance_incidents'].includes(entidad)
      ? ['read', 'update', 'approve', 'reject']
      : ['read'];
  // Empleado
  if (['leave_requests', 'salary_advances'].includes(entidad)) return ['create', 'read'];
  if (['payslips', 'documents', 'training_records', 'announcements', 'attendance_records'].includes(entidad)) return ['read'];
  return [];
}

export function can(rol, entidad, habilidad) {
  return abilities(rol, entidad).includes(habilidad);
}

// Módulos visibles por rol (define el sidebar)
export const MODULOS_POR_ROL = {
  Administrador: null, // todos
  'Recursos Humanos': null,
  Gerencia: ['inicio','empleados','asistencia','turnos','vacaciones','nomina','adelantos','desempeno','capacitaciones','anuncios','reportes'],
  'Encargado de sucursal': ['inicio','empleados','asistencia','turnos','vacaciones','adelantos','desempeno','documentacion','capacitaciones','anuncios','reportes'],
  Supervisor: ['inicio','empleados','asistencia','turnos','vacaciones','anuncios'],
  Empleado: ['inicio','asistencia','vacaciones','nomina','adelantos','documentacion','capacitaciones','anuncios']
};

export const VE_NOMINA = ['Administrador', 'Recursos Humanos', 'Gerencia'];
