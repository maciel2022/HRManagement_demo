// Capa de acceso a datos por entidad. Es el ÚNICO punto que tocan los componentes.
// Cada función es async a propósito: al cambiar el dataset por HTTP no cambia la UI.

import { getDb, detalleDe } from '@/data/database';
import { resolve, tabla, audit, auditLog, conteos } from './client';
import { ENTIDADES, abilities } from '@/lib/permissions';

/* ---------- alcance de datos (data_scope) ---------- */

export function alcance(emps, { sucursal, rol }) {
  let list = emps;
  if (sucursal && sucursal !== 'Todas las sucursales') list = list.filter((e) => e.suc === sucursal);
  if (rol === 'Empleado') list = list.filter((e) => e.id === emps[0].id);
  return list;
}

const activos = () => getDb().emps.filter((e) => e.estado !== 'Baja');

/* ---------- Catálogos del perfil activo ---------- */

export const catalogoApi = {
  sucursalesNombres: () => getDb().branches.map((b) => b.name),
  areasNombres: () => getDb().departments.map((d) => d.name),
  puestosNombres: () => getDb().positions.map((p) => p.name),
  turnosNombres: () => getDb().shifts.map((s) => s.name),
  turnosConHorario: () =>
    getDb().shifts.map((s) => (s.start_time ? `${s.name} (${s.start_time}–${s.end_time})` : s.name)),
  tiposLicenciaNombres: () => getDb().leave_types.map((t) => t.name),
  tiposDocumentoNombres: () => getDb().document_types.map((t) => t.name),
  empleadosNombres: () => activos().map((e) => e.full + ' — ' + e.legajo),
  dotacion: (sucursal) =>
    activos().filter((e) => sucursal === 'Todas las sucursales' || e.suc === sucursal).length,
  totalEmpleados: () => getDb().emps.length,
  porSucursal: (name) => getDb().emps.filter((e) => e.suc === name).length,
  // Nombre corto de la unidad operativa (sin el prefijo configurado: "Estación", "Sucursal", "Centro"…)
  corta: (name) => (name ?? '').replace(getDb().catalog.unidad + ' ', '')
};

/* ---------- Empleados ---------- */

export const empleadosApi = {
  async list({ sucursal, rol, area = 'Todas', puesto = 'Todos', estado = 'Todos', turno = 'Todos', q = '' } = {}) {
    let list = alcance(getDb().emps, { sucursal, rol });
    list = list.filter((e) => e.estado !== 'Baja' || estado === 'Baja');
    if (area !== 'Todas') list = list.filter((e) => e.area === area);
    if (puesto !== 'Todos') list = list.filter((e) => e.puesto === puesto);
    if (estado !== 'Todos') list = list.filter((e) => e.estado === estado);
    if (turno !== 'Todos') list = list.filter((e) => e.turno === turno);
    const t = q.trim().toLowerCase();
    if (t) list = list.filter((e) => (e.full + ' ' + e.legajo + ' ' + e.dni + ' ' + e.puesto).toLowerCase().includes(t));
    return resolve(list);
  },
  async get(id) {
    return resolve(getDb().emps.find((e) => e.id === id) ?? null);
  },
  async detalle(emp) {
    return resolve(detalleDe(emp));
  },
  async create(payload, ctx) {
    audit('create', 'employees', 'L-1200', 'Alta de legajo', ctx.usuario, ctx.rol);
    return resolve({ ok: true, legajo: 'L-1200', payload });
  },
  async update(emp, accion, ctx) {
    audit('update', 'employees', emp?.legajo ?? '—', accion, ctx.usuario, ctx.rol);
    return resolve({ ok: true });
  }
};

/* ---------- Asistencia ---------- */

export const asistenciaApi = {
  async delDia({ sucursal, rol }) {
    return resolve(alcance(activos(), { sucursal, rol }));
  },
  async mensual(emp) {
    return resolve(detalleDe(emp).asis);
  },
  async incidencias() {
    return resolve(getDb().incs);
  },
  async resolverIncidencia(id, modo, ctx) {
    const db = getDb();
    db.incs = db.incs.filter((i) => i.id !== id);
    audit('update', 'attendance_incidents', id, modo === 'fix' ? 'Fichada corregida manualmente' : 'Justificada por RRHH', ctx.usuario, ctx.rol);
    return resolve(db.incs);
  },
  async importar(lote, ctx) {
    audit('import', 'attendance_records', 'BATCH-' + (getDb().import_batches.length + 1), lote, ctx.usuario, ctx.rol);
    return resolve({ ok: true, registros: 248, incidencias: getDb().incs.length });
  },
  dispositivos: () => getDb().catalog.devices,
  puntosAcceso: () => getDb().catalog.accessPoints,
  lotes: () => tabla('import_batches')
};

/* ---------- Turnos ---------- */

export const turnosApi = {
  async semana({ sucursal, rol }) {
    return resolve(alcance(activos(), { sucursal, rol }));
  },
  async cobertura() {
    const db = getDb();
    const out = [];
    db.branches.forEach((b) => {
      db.shifts
        .filter((s) => !s.rotating)
        .forEach((s) => {
          const asignados = db.emps.filter(
            (e) => e.suc === b.name && e.estado !== 'Baja' && (e.turno === s.name || e.turno === 'Rotativo')
          ).length;
          out.push({ sucursal: b.name, turno: s.name, asignados, requeridos: s.required_staff || 4 });
        });
    });
    return resolve(out);
  },
  definiciones: () => getDb().shifts,
  async asignar(emp, dia, ctx) {
    audit('update', 'attendance_records', emp?.legajo ?? '—', 'Turno reasignado — ' + dia, ctx.usuario, ctx.rol);
    return resolve({ ok: true });
  }
};

/* ---------- Vacaciones y licencias ---------- */

export const licenciasApi = {
  async list({ sucursal, rol }) {
    const ids = new Set(alcance(getDb().emps, { sucursal, rol }).map((e) => e.id));
    return resolve(getDb().reqs.filter((r) => ids.has(r.emp.id)));
  },
  async saldos({ sucursal, rol }) {
    return resolve(alcance(activos(), { sucursal, rol }));
  },
  async create(payload, ctx) {
    audit('create', 'leave_requests', 'SOL-nueva', 'Solicitud enviada al supervisor', ctx.usuario, ctx.rol);
    return resolve({ ok: true, payload });
  },
  async decidir(id, estado, ctx) {
    if (!abilities(ctx.rol, 'leave_requests').includes(estado === 'Aprobado' ? 'approve' : 'reject')) {
      return resolve({ ok: false, error: 'Tu rol no tiene permiso para esta acción.' });
    }
    const db = getDb();
    db.reqs = db.reqs.map((r) => (r.id === id ? { ...r, estado, etapa: 'Cerrada' } : r));
    audit(estado === 'Aprobado' ? 'approve' : 'reject', 'leave_requests', id, 'Estado → ' + estado, ctx.usuario, ctx.rol);
    return resolve({ ok: true, reqs: db.reqs });
  },
  tipos: () => tabla('leave_types')
};

/* ---------- Nómina ---------- */

export const nominaApi = {
  periodos: () => tabla('payroll_periods'),
  async liquidacion({ sucursal, rol }) {
    const db = getDb();
    const list = alcance(activos(), { sucursal, rol });
    return resolve(
      list.map((e) => {
        const d = detalleDe(e);
        const adelantos = db.adels
          .filter((a) => a.emp.id === e.id && a.estado === 'Aplicado a liquidación')
          .reduce((acc, a) => acc + a.importe, 0);
        return { emp: e, detalle: d, adelantos };
      })
    );
  },
  async recibo(emp, periodo) {
    return resolve({ emp, periodo, detalle: detalleDe(emp) });
  },
  async cerrar(periodo, ctx) {
    audit('update', 'payroll_periods', periodo, 'Enviada a aprobación de Gerencia', ctx.usuario, ctx.rol);
    return resolve({ ok: true });
  },
  async exportarRecibo(emp, ctx) {
    audit('export', 'payslips', emp?.legajo ?? '—', 'Recibo descargado (PDF simulado)', ctx.usuario, ctx.rol);
    return resolve({ ok: true });
  }
};

/* ---------- Adelantos ---------- */

export const adelantosApi = {
  async list({ sucursal, rol }) {
    const ids = new Set(alcance(getDb().emps, { sucursal, rol }).map((e) => e.id));
    return resolve(getDb().adels.filter((a) => ids.has(a.emp.id)));
  },
  async create(payload, ctx) {
    audit('create', 'salary_advances', 'ADL-nuevo', 'Adelanto solicitado', ctx.usuario, ctx.rol);
    return resolve({ ok: true, payload });
  },
  async decidir(id, estado, ctx) {
    if (!abilities(ctx.rol, 'salary_advances').includes(estado === 'Aprobado' ? 'approve' : 'reject')) {
      return resolve({ ok: false, error: 'Tu rol no tiene permiso para esta acción.' });
    }
    const db = getDb();
    db.adels = db.adels.map((a) => (a.id === id ? { ...a, estado } : a));
    audit(estado === 'Aprobado' ? 'approve' : 'reject', 'salary_advances', id, 'Estado → ' + estado, ctx.usuario, ctx.rol);
    return resolve({ ok: true, adels: db.adels });
  }
};

/* ---------- Desempeño ---------- */

export const desempenoApi = {
  async list({ sucursal, rol }) {
    const list = alcance(activos(), { sucursal, rol }).slice(0, 14);
    return resolve(list.map((e) => ({ emp: e, detalle: detalleDe(e) })));
  },
  competencias: () => tabla('competencies'),
  async create(ctx) {
    audit('create', 'performance_reviews', 'EVA-nueva', 'Evaluación creada en borrador', ctx.usuario, ctx.rol);
    return resolve({ ok: true });
  }
};

/* ---------- Documentación y EPP ---------- */

export const documentosApi = {
  async list({ sucursal, rol, estado = 'Todos' }) {
    const base = alcance(activos(), { sucursal, rol }).slice(0, 30);
    const rows = [];
    base.forEach((e) => detalleDe(e).docs.forEach((d) => rows.push({ emp: e, ...d })));
    return resolve(estado === 'Todos' ? rows : rows.filter((r) => r.estado === estado));
  },
  async epp(emp) {
    return resolve(detalleDe(emp).epp);
  },
  documentoCritico: () => getDb().catalog.documentoCritico,
  async upload(emp, ctx) {
    audit('create', 'documents', emp?.legajo ?? '—', 'Documento cargado al legajo', ctx.usuario, ctx.rol);
    return resolve({ ok: true });
  }
};

/* ---------- Capacitaciones ---------- */

export const capacitacionesApi = {
  async cursos({ sucursal, rol }) {
    const db = getDb();
    const base = alcance(activos(), { sucursal, rol });
    return resolve(
      db.trainings.map((c, i) => {
        const registros = db.training_records.filter((r) => r.training_id === c.id);
        const asignados = Math.max(28, Math.min(base.length, registros.length || 30));
        const completados = registros.filter((r) => r.status === 'Completada').length || Math.round(asignados * 0.6);
        return { ...c, asignados, completados, pct: Math.round((completados / asignados) * 100), orden: i };
      })
    );
  },
  async cumplimiento() {
    const db = getDb();
    return resolve(
      db.branches.map((b) => {
        const ids = new Set(db.employees.filter((e) => e.branch_id === b.id).map((e) => e.id));
        const regs = db.training_records.filter((r) => ids.has(r.employee_id));
        const comp = regs.filter((r) => r.status === 'Completada').length;
        const pct = regs.length ? Math.round((comp / regs.length) * 100) : 0;
        return { sucursal: b.name, pct, pendientes: regs.length - comp };
      })
    );
  },
  async pendientes({ sucursal, rol }) {
    return resolve(alcance(activos(), { sucursal, rol }).slice(0, 8));
  },
  cursoCritico: () => getDb().catalog.cursoCritico,
  async asignar(curso, ctx) {
    audit('update', 'training_records', curso, 'Curso asignado a los pendientes', ctx.usuario, ctx.rol);
    return resolve({ ok: true });
  }
};

/* ---------- Anuncios ---------- */

export const anunciosApi = {
  list: () => resolve(getDb().announcements),
  async create(payload, ctx) {
    audit('create', 'announcements', 'ANU-nuevo', 'Anuncio publicado a la red', ctx.usuario, ctx.rol);
    return resolve({ ok: true, payload });
  },
  async marcarLeido(id, ctx) {
    const db = getDb();
    db.announcement_reads = [...db.announcement_reads, { announcement_id: id, user: ctx.usuario }];
    return resolve({ ok: true });
  }
};

/* ---------- Reportes ---------- */

export const reportesApi = {
  async datos({ sucursal, rol }) {
    return resolve(alcance(activos(), { sucursal, rol }).slice(0, 14));
  },
  async exportar(reporte, formato, ctx) {
    audit('export', 'payslips', reporte, 'Exportado a ' + formato, ctx.usuario, ctx.rol);
    return resolve({ ok: true });
  }
};

/* ---------- Administración ---------- */

export const adminApi = {
  sucursales: () => tabla('branches'),
  areas: () => tabla('departments'),
  puestos: () => tabla('positions'),
  turnos: () => tabla('shifts'),
  tiposLicencia: () => tabla('leave_types'),
  feriados: () => tabla('holidays'),
  usuarios: () => tabla('users'),
  roles: () => tabla('roles'),
  puestosDeArea: (name) => getDb().catalog.departments.find((d) => d.name === name)?.positions ?? [],
  dotacionPorSucursal: (name) => activos().filter((e) => e.suc === name).length,
  dotacionPorArea: (name) => activos().filter((e) => e.area === name).length,
  dotacionPorPuesto: (name) => activos().filter((e) => e.puesto === name).length,
  dotacionPorTurno: (name) => activos().filter((e) => e.turno === name).length,
  modelo(rol) {
    const counts = conteos();
    return Object.entries(ENTIDADES).map(([key, e]) => ({
      key, ...e, registros: counts[e.t] ?? 0, abilities: abilities(rol, key)
    }));
  },
  auditoria: () => auditLog(),
  lotes: () => tabla('import_batches'),
  async create(entidad, ctx) {
    audit('create', entidad, 'nuevo', 'Registro creado en la configuración', ctx.usuario, ctx.rol);
    return resolve({ ok: true });
  }
};

/* ---------- Dashboard ---------- */

export const dashboardApi = {
  async resumen({ sucursal, rol, area = 'Todas', puesto = 'Todos', estado = 'Todos' }) {
    const db = getDb();
    const base = await empleadosApi.list({ sucursal, rol, area, puesto, estado });
    const cnt = (st) => base.filter((e) => e.hoy === st).length;
    const docsPorVencer = db.documents.filter((d) => d.status === 'Próximo a vencer').length;
    return resolve({
      base,
      total: base.length,
      presentes: cnt('Presente'),
      ausentes: cnt('Ausente'),
      tarde: cnt('Tarde'),
      franco: cnt('Franco'),
      vacaciones: base.filter((e) => e.estado === 'Vacaciones').length,
      licencia: base.filter((e) => e.estado === 'Licencia').length,
      cumples: base.filter((e) => e.nacMes === 9),
      aniversarios: base.filter((e) => e.ingreso.slice(3, 5) === '09' && e.anios > 0).slice(0, 5),
      turnosActivos: db.shifts.filter((s) => !s.rotating).length,
      solicitudesPendientes: db.reqs.filter((r) => ['Pendiente', 'En revisión'].includes(r.estado)).length,
      adelantosPendientes: db.adels.filter((a) => ['Solicitado', 'En revisión'].includes(a.estado)).length,
      incidencias: db.incs.length,
      sinSalida: base.filter((e) => e.salida === '—' && e.entrada !== '—').length,
      docsPorVencer
    });
  }
};
