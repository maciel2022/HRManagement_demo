// Dataset de demostración en memoria, construido para el perfil activo.
// Esquema normalizado: el mismo que después vive en la base relacional.
// Los componentes no importan este archivo: acceden por src/api.

import { TIPOS_LICENCIA, ROLES, USUARIOS, FERIADOS_NACIONALES } from './catalogos';
import { generarEmpleados, generarDetalle, generarSolicitudes, generarAdelantos, generarIncidencias } from './generador';

function buildDatabase(profile) {
  const cat = profile.catalog;
  const emps = generarEmpleados(cat);
  const detalles = {};
  emps.forEach((e) => {
    detalles[e.id] = generarDetalle(e, cat);
  });

  const branches = cat.branches.map((s, i) => ({
    id: i + 1, code: 'SUC-0' + (i + 1), name: s.name, address: s.address, city: s.city,
    province: s.province, opening_hours: '24 h — ' + cat.shifts.filter((t) => !t.rotating).length + ' turnos',
    is_active: true, manager_employee_id: null, manager_name: s.managerName
  }));
  const departments = cat.departments.map((a, i) => ({ id: i + 1, name: a.name, cost_center: 'CC-0' + (i + 1) }));
  const positions = [];
  cat.departments.forEach((a, ai) =>
    a.positions.forEach((p) =>
      positions.push({
        id: positions.length + 1, name: p, department_id: ai + 1,
        salary_min: a.salaryRange[0], salary_max: a.salaryRange[1], agreement: cat.convenio
      })
    )
  );
  const shifts = cat.shifts.map((t, i) => ({
    id: i + 1, name: t.name, start_time: t.start, end_time: t.end,
    tolerance_min: t.tolerance, is_night: t.night, rotating: t.rotating, required_staff: t.required
  }));
  const leave_types = TIPOS_LICENCIA.map((t, i) => ({
    id: i + 1, name: t, is_paid: i !== 10, requires_certificate: i !== 0 && i !== 7,
    approval_flow: i === 0 ? 'supervisor,hr' : 'hr',
    cap: i === 0 ? 'Según antigüedad (configurable)' : 'Configurable por política interna'
  }));

  const findBy = (arr, name) => arr.find((x) => x.name === name);
  const employees = emps.map((e) => ({
    id: e.id + 1, file_number: e.legajo, first_name: e.nombre, last_name: e.apellido,
    dni: e.dni, cuil: e.cuil, birth_date: e.nac, address: e.dir, city: e.ciudad, province: e.prov,
    phone: e.tel, email: e.email, emergency_contact: e.emerg,
    branch_id: findBy(branches, e.suc).id,
    department_id: findBy(departments, e.area).id,
    position_id: findBy(positions, e.puesto).id,
    shift_id: findBy(shifts, e.turno).id,
    supervisor_employee_id: null,
    hired_at: e.ingreso, contract_type: e.contrato, status: e.estado, base_salary: e.sueldo
  }));
  employees.forEach((row, i) => {
    const sup = employees.find((x) => x.first_name + ' ' + x.last_name === emps[i].sup);
    row.supervisor_employee_id = sup ? sup.id : null;
    emps[i].row = row;
  });
  branches.forEach((b) => {
    const enc = employees.find(
      (e) => e.branch_id === b.id && departments.find((d) => d.id === e.department_id).name === cat.managerDepartment
    );
    b.manager_employee_id = enc ? enc.id : null;
  });

  const activos = emps.filter((e) => e.estado !== 'Baja');
  const attendance_records = activos.map((e, i) => ({
    id: i + 1, employee_id: e.id + 1, work_date: '2026-09-03', shift_id: findBy(shifts, e.turno).id,
    check_in: e.entrada, check_out: e.salida, worked_hours: e.hs, overtime_hours: e.extras,
    late_minutes: e.tardeMin, early_leave_minutes: 0, status: e.hoy,
    source: 'hikvision_import', import_batch_id: 1
  }));

  const incs = generarIncidencias(emps, cat);
  const attendance_incidents = incs.map((i, ix) => ({
    id: ix + 1, code: i.id, employee_id: i.emp.id + 1, work_date: i.fecha, type: i.tipo,
    description: i.det, device: i.disp, access_point: i.punto, status: 'open',
    resolved_by_user_id: null, resolved_at: null
  }));

  const reqs = generarSolicitudes(emps);
  const leave_requests = reqs.map((r, ix) => ({
    id: ix + 1, code: r.id, employee_id: r.emp.id + 1, leave_type_id: findBy(leave_types, r.tipo).id,
    start_date: r.desde, end_date: r.hasta, days: r.dias, reason: r.motivo, notes: r.obs,
    attachment: r.adjunto, status: r.estado, stage: r.etapa, requested_at: r.solicitado,
    approved_by_user_id: null, approved_at: null
  }));

  const leave_balances = activos.map((e, ix) => ({
    id: ix + 1, employee_id: e.id + 1, period_year: 2026, entitled_days: e.vacDisp,
    used_days: e.vacUsados, pending_days: e.vacPend, next_period_start: '2027-01-01'
  }));

  const adels = generarAdelantos(emps);
  const salary_advances = adels.map((a, ix) => ({
    id: ix + 1, code: a.id, employee_id: a.emp.id + 1, requested_at: a.fecha, amount: a.importe,
    installments: a.cuotas, reason: a.motivo, notes: a.obs, status: a.estado,
    deducted_amount: a.descontado, payroll_period_id: a.estado === 'Aplicado a liquidación' ? 1 : null
  }));

  const payroll_periods = [
    { id: 1, name: 'Liquidación Agosto 2026', period_month: 8, period_year: 2026, status: 'En revisión', payment_date: '05/09/2026', employees: activos.length },
    { id: 2, name: 'Liquidación Julio 2026', period_month: 7, period_year: 2026, status: 'Liquidada', payment_date: '05/08/2026', employees: activos.length - 1 },
    { id: 3, name: 'Liquidación Junio 2026', period_month: 6, period_year: 2026, status: 'Cerrada', payment_date: '05/07/2026', employees: activos.length - 1 },
    { id: 4, name: 'SAC 1° semestre 2026', period_month: 6, period_year: 2026, status: 'Cerrada', payment_date: '30/06/2026', employees: activos.length - 1 },
    { id: 5, name: 'Liquidación Septiembre 2026', period_month: 9, period_year: 2026, status: 'Borrador', payment_date: '—', employees: activos.length }
  ];
  const payslips = activos.map((e, ix) => {
    const d = detalles[e.id];
    return {
      id: ix + 1, payroll_period_id: 1, employee_id: e.id + 1, base_salary: e.sueldo,
      overtime_amount: d.extraAmount, night_premium: d.nightAmount,
      bonuses: Math.round(e.sueldo * 0.0833), advances_deducted: 0,
      gross_amount: Math.round(d.bruto), deductions: Math.round(d.aportes),
      net_amount: Math.round(d.neto), status: 'Liquidada'
    };
  });

  const document_types = cat.documentTypes.map((n, i) => ({ id: i + 1, name: n, has_expiry: i > 1, alert_days_before: 30 }));
  const documents = [];
  emps.slice(0, 30).forEach((e) =>
    detalles[e.id].docs.forEach((d) =>
      documents.push({
        id: documents.length + 1, employee_id: e.id + 1, document_type_id: findBy(document_types, d.tipo).id,
        uploaded_at: d.subida, expires_at: d.vence, status: d.estado, notes: d.nota, file_path: null
      })
    )
  );

  const trainings = cat.trainings.map((c, i) => ({
    id: i + 1, name: c.name, is_mandatory: c.mandatory, duration_hours: c.hours, validity_months: c.validityMonths
  }));
  const training_records = [];
  emps.slice(0, 30).forEach((e) =>
    detalles[e.id].caps.forEach((c) =>
      training_records.push({
        id: training_records.length + 1, employee_id: e.id + 1, training_id: findBy(trainings, c.curso).id,
        progress_pct: c.prog, status: c.estado, completed_at: c.fin, expires_at: c.vence, certificate_code: c.cert
      })
    )
  );

  const competencies = cat.competencies.map((n, i) => ({ id: i + 1, name: n, scale_min: 1, scale_max: 5 }));
  const performance_reviews = emps.slice(0, 14).map((e, ix) => ({
    id: ix + 1, employee_id: e.id + 1, period: '1S-2026', reviewer_employee_id: null,
    overall_score: detalles[e.id].prom,
    status: detalles[e.id].prom >= 4 ? 'Aprobado' : 'En revisión',
    supervisor_comment: detalles[e.id].comentarioSup,
    employee_comment: detalles[e.id].comentarioEmp
  }));
  const review_scores = [];
  performance_reviews.forEach((r) =>
    competencies.forEach((c) =>
      review_scores.push({ id: review_scores.length + 1, performance_review_id: r.id, competency_id: c.id, score: 4 })
    )
  );

  const equipment_items = cat.ppe.map((it, i) => ({ id: i + 1, name: it.name, is_ppe: it.ppe, replacement_months: it.replacementMonths }));
  const equipment_issues = [];
  emps.slice(0, 30).forEach((e) =>
    detalles[e.id].epp.forEach((p, i) =>
      equipment_issues.push({
        id: equipment_issues.length + 1, employee_id: e.id + 1, equipment_item_id: i + 1,
        size: p.talle, quantity: parseInt(p.cant, 10), delivered_at: p.entrega,
        acknowledged: p.ack === 'Firmado', replacement_due: p.repo
      })
    )
  );

  const roles = ROLES.map((r, i) => ({ id: i + 1, ...r }));
  const users = [
    [profile.demoUser.name, profile.demoUser.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ /g, '.'), profile.demoUser.role, null, 'Toda la red', 'Hoy 09:12'],
    ...USUARIOS
  ].map((u, i) => ({
    id: i + 1, full_name: u[0], username: u[1], role_id: findBy(roles, u[2]).id, role_name: u[2],
    branch_id: u[3], scope_label: u[4] ?? (u[3] ? branches[u[3] - 1].name : 'Toda la red'),
    last_login: u[5], employee_id: null, is_active: true
  }));

  const announcements = cat.announcements.map((a) => ({ ...a, author_user_id: 1, is_active: true }));
  const holidays = [
    ...FERIADOS_NACIONALES.map((f) => [...f, 'national']),
    [...cat.aniversarioEmpresa, 'company']
  ]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map((f, i) => ({ id: i + 1, holiday_date: f[0], label: f[1], name: f[2], scope: f[3], surcharge_pct: 100 }));

  const import_batches = [
    {
      id: 1, source: 'Hikvision', file_name: 'AccessControl_0109-0209.csv', rows: 248,
      imported_at: '03/09/2026 07:10', created_incidents: incs.length, status: 'Procesado'
    }
  ];

  return {
    profileId: profile.id,
    catalog: cat,
    // vistas de dominio
    emps, detalles, reqs, adels, incs,
    // esquema normalizado
    branches, departments, positions, shifts, employees, attendance_records, attendance_incidents,
    leave_types, leave_requests, leave_balances, payroll_periods, payslips, document_types, documents,
    trainings, training_records, competencies, performance_reviews, review_scores, equipment_items,
    equipment_issues, announcements, announcement_reads: [], holidays, roles, users, import_batches,
    audit_log: []
  };
}

const cache = new Map();
let activeId = null;

// Lo llama ConfigProvider al montar y en cada cambio de empresa demo.
export function setActiveProfile(profile) {
  if (!cache.has(profile.id)) cache.set(profile.id, buildDatabase(profile));
  activeId = profile.id;
  return cache.get(activeId);
}

export function getDb() {
  return cache.get(activeId);
}

export function detalleDe(emp) {
  return getDb().detalles[emp.id];
}
