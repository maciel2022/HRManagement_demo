// Generador determinístico de datos de demostración.
// Recibe el catálogo del perfil activo: no conoce ninguna empresa en particular.

import { NOMBRES_M, NOMBRES_F, APELLIDOS, CALLES, CONTRATOS, TIPOS_LICENCIA } from './catalogos';

const HUES = ['#e6f0ee', '#f0eaf9', '#e9eff9', '#fbf1de', '#e7f3ec', '#fbeaea', '#eeece7'];
const HUE_FG = {
  '#e6f0ee': '#12665c', '#f0eaf9': '#6b4a9e', '#e9eff9': '#2f5fa8', '#fbf1de': '#9a6a10',
  '#e7f3ec': '#1f7a4d', '#fbeaea': '#a83232', '#eeece7': '#6b6a63'
};

export function rng(seed) {
  let s = seed;
  const r = () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
  return { r, pick: (a) => a[Math.floor(r() * a.length)], int: (a, b) => a + Math.floor(r() * (b - a + 1)) };
}

export const d2 = (n) => (n < 10 ? '0' + n : '' + n);
const fdate = (d) => d2(d.getDate()) + '/' + d2(d.getMonth() + 1) + '/' + d.getFullYear();

export function generarEmpleados(cat) {
  const g = rng(20260903);
  const pool = [];
  cat.departments.forEach((a) => {
    for (let i = 0; i < a.weight; i++) pool.push(a);
  });
  const turnos = cat.shifts.map((t) => t.name);
  const emps = [];

  for (let i = 0; i < pool.length; i++) {
    const a = pool[i];
    const fem = g.r() < 0.42;
    const nombre = fem ? g.pick(NOMBRES_F) : g.pick(NOMBRES_M);
    const apellido = g.pick(APELLIDOS);
    const suc = cat.branches[i % cat.branches.length];
    const puesto = g.pick(a.positions);
    const turno = cat.officeDepartments.includes(a.name) ? turnos[0] : g.pick(turnos);
    const ingY = g.int(2013, 2026);
    const ingM = g.int(1, 12);
    const ing = new Date(ingY, ingM - 1, g.int(1, 28));
    const anios = Math.max(0, 2026 - ingY - (ingM > 9 ? 1 : 0));
    const nacY = g.int(1972, 2004);
    const nacM = g.int(1, 12);
    const nacD = g.int(1, 28);
    const sueldo = Math.round((a.salaryRange[0] + g.r() * (a.salaryRange[1] - a.salaryRange[0])) / 1000) * 1000;
    const roll = g.r();
    const estado = roll > 0.955 ? 'Baja' : roll > 0.9 ? 'Vacaciones' : roll > 0.865 ? 'Licencia' : 'Activo';
    const bg = HUES[i % HUES.length];
    const dni = 20000000 + Math.floor(g.r() * 25000000);

    emps.push({
      id: i,
      legajo: 'L-' + (1000 + i * 3),
      nombre,
      apellido,
      full: nombre + ' ' + apellido,
      ini: nombre[0] + apellido[0],
      bg,
      fg: HUE_FG[bg],
      dni: dni.toLocaleString('es-AR').replace(/,/g, '.'),
      cuil: (fem ? '27-' : '20-') + dni + '-' + g.int(0, 9),
      nac: d2(nacD) + '/' + d2(nacM) + '/' + nacY,
      nacMes: nacM,
      nacDia: nacD,
      edad: 2026 - nacY,
      dir: g.pick(CALLES) + ' ' + g.int(100, 4800),
      ciudad: suc.city,
      prov: suc.province,
      tel: '+54 9 11 ' + g.int(4000, 6999) + '-' + g.int(1000, 9999),
      email:
        (nombre + '.' + apellido).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') +
        '@' + cat.emailDomain,
      emerg: g.pick(NOMBRES_F) + ' ' + apellido + ' — +54 9 11 ' + g.int(4000, 6999) + '-' + g.int(1000, 9999) + ' (familiar)',
      suc: suc.name,
      sucDir: suc.address,
      area: a.name,
      puesto,
      turno,
      ingreso: fdate(ing),
      anios,
      contrato: anios > 1 ? 'Tiempo indeterminado' : g.pick(CONTRATOS),
      estado,
      sueldo,
      jornada: cat.shifts.find((t) => t.name === turno)?.rotating ? '48 h semanales rotativas' : '8 h diarias — ' + turno
    });
  }

  cat.branches.forEach((s) => {
    const enc = emps.find((e) => e.suc === s.name && e.area === cat.managerDepartment) || emps.find((e) => e.suc === s.name);
    s.managerName = enc.full;
    emps.filter((e) => e.suc === s.name).forEach((e) => {
      e.sup = e.id === enc.id ? 'Dirección de Operaciones' : enc.full;
    });
  });

  // Asistencia del día: los KPI del dashboard se derivan de acá
  emps.forEach((e) => {
    e.hoy = e.estado === 'Activo' ? null : e.estado === 'Baja' ? 'Baja' : e.estado;
    if (!e.hoy) {
      const x = g.r();
      e.hoy = x < 0.62 ? 'Presente' : x < 0.74 ? 'Franco' : x < 0.84 ? 'Tarde' : x < 0.9 ? 'Ausente' : 'Presente';
    }
    const turnoDef = cat.shifts.find((t) => t.name === e.turno) ?? cat.shifts[0];
    const ini = parseInt((turnoDef.start ?? cat.shifts[0].start ?? '06:00').slice(0, 2), 10);
    const tardeMin = e.hoy === 'Tarde' ? g.int(8, 47) : 0;
    const sinFichada = ['Ausente', 'Franco', 'Vacaciones', 'Licencia', 'Baja'].includes(e.hoy);
    e.entrada = sinFichada ? '—' : d2(ini) + ':' + d2(tardeMin);
    e.salida = sinFichada ? '—' : g.r() < 0.07 ? '—' : d2((ini + 8) % 24) + ':' + d2(g.int(0, 25));
    e.tardeMin = tardeMin;
    e.hs = e.entrada === '—' || e.salida === '—' ? 0 : 8;
    e.extras = g.r() < 0.22 ? g.int(1, 4) : 0;
    e.vacDisp = Math.min(35, 14 + e.anios * 2);
    e.vacUsados = g.int(0, Math.max(1, e.vacDisp - 5));
    e.vacPend = e.vacDisp - e.vacUsados;
  });

  return emps;
}

export function generarDetalle(e, cat) {
  const g = rng(7000 + e.id * 131);
  const dias = ['03/09/2026','02/09/2026','01/09/2026','31/08/2026','30/08/2026','29/08/2026','28/08/2026','27/08/2026','26/08/2026','25/08/2026'];
  const turnoDef = cat.shifts.find((t) => t.name === e.turno) ?? cat.shifts[0];
  const iniHora = parseInt((turnoDef.start ?? cat.shifts[0].start ?? '06:00').slice(0, 2), 10);

  const asis = dias.map((d, i) => {
    const x = g.r();
    const st = i === 0 ? e.hoy : x < 0.66 ? 'Presente' : x < 0.78 ? 'Franco' : x < 0.87 ? 'Tarde' : x < 0.93 ? 'Ausente' : 'Licencia';
    const t = st === 'Tarde' ? g.int(9, 42) : 0;
    const noSal = g.r() < 0.09 && st === 'Presente';
    const libre = ['Ausente', 'Franco', 'Licencia'].includes(st);
    return {
      fecha: d,
      estado: st,
      ent: libre ? '—' : d2(iniHora) + ':' + d2(t),
      sal: libre ? '—' : noSal ? '—' : d2((iniHora + 8) % 24) + ':' + d2(g.int(0, 22)),
      hs: st === 'Presente' || st === 'Tarde' ? (noSal ? '—' : '8:00') : '0:00',
      extra: g.r() < 0.2 ? g.int(1, 3) + ':00' : '—',
      tarde: t ? t + ' min' : '—',
      nota: noSal
        ? 'Falta fichada de salida'
        : st === 'Ausente'
        ? g.r() < 0.5
          ? 'Falta justificada'
          : 'Falta injustificada'
        : st === 'Tarde'
        ? 'Llegada tarde'
        : '—'
    };
  });

  const docs = cat.documentTypes.map((t, i) => {
    const x = g.r();
    const st = i < 3 ? 'Vigente' : x < 0.16 ? 'Vencido' : x < 0.36 ? 'Próximo a vencer' : x < 0.46 ? 'Pendiente' : 'Vigente';
    return {
      tipo: t,
      subida: d2(g.int(1, 28)) + '/' + d2(g.int(1, 12)) + '/' + g.int(2023, 2026),
      vence: i < 2 ? 'Sin vencimiento' : d2(g.int(1, 28)) + '/' + d2(g.int(9, 12)) + '/2026',
      estado: st,
      nota: st === 'Pendiente' ? 'Solicitado al empleado el 28/08' : st === 'Vencido' ? 'Requiere renovación inmediata' : '—'
    };
  });

  const caps = cat.trainings.map((c) => {
    const x = g.r();
    const st = x < 0.55 ? 'Completada' : x < 0.78 ? 'En curso' : 'No iniciada';
    return {
      curso: c.name,
      obl: c.mandatory ? 'Sí' : 'No',
      estado: st,
      prog: st === 'Completada' ? 100 : st === 'En curso' ? g.int(20, 85) : 0,
      fin: st === 'Completada' ? d2(g.int(1, 28)) + '/' + d2(g.int(1, 8)) + '/2026' : '—',
      vence: st === 'Completada' ? d2(g.int(1, 28)) + '/' + d2(g.int(1, 12)) + '/2027' : '—',
      cert: st === 'Completada' ? 'Certificado ' + g.int(1000, 9999) : '—'
    };
  });

  const epp = cat.ppe.map((it, i) => ({
    item: it.name,
    talle: /calzado/i.test(it.name) ? '' + g.int(38, 45) : g.pick(['S', 'M', 'L', 'XL']),
    cant: it.qty,
    entrega: ['12/03/2026', '12/03/2026', '12/03/2026', '01/08/2026', '20/05/2026'][i % 5],
    ack: i === 4 && g.r() < 0.3 ? 'Pendiente' : 'Firmado',
    repo: ['12/09/2026', '12/03/2027', '12/12/2026', '01/11/2026', '20/05/2028'][i % 5]
  }));

  const comps = cat.competencies.map((n) => {
    const v = g.int(2, 5);
    return { n, v, pct: v * 20, label: v + '/5' };
  });
  const prom = Math.round((comps.reduce((a, c) => a + c.v, 0) / comps.length) * 10) / 10;

  const extraAmount = (e.extras || 0) * Math.round((e.sueldo / 192) * 1.5);
  const nightAmount = turnoDef.night ? Math.round(e.sueldo * 0.08) : 0;
  const bruto = e.sueldo + extraAmount + nightAmount;

  return {
    asis, docs, caps, epp, comps, prom, extraAmount, nightAmount, bruto,
    neto: bruto * 0.83,
    aportes: bruto * 0.17,
    objetivos: [
      { n: 'Reducir desvíos de procedimiento a menos del 0,2%', prog: g.int(45, 100) },
      { n: 'Completar capacitaciones obligatorias del año', prog: g.int(50, 100) },
      { n: 'Sostener cero llegadas tarde por trimestre', prog: g.int(30, 95) }
    ],
    comentarioSup: 'Buen desempeño general en la atención al público. Debe reforzar el cumplimiento del procedimiento de cierre de turno.',
    comentarioEmp: 'Me interesa capacitarme para poder cubrir otros puestos los fines de semana.',
    recibos: ['Agosto 2026', 'Julio 2026', 'Junio 2026', 'Mayo 2026', 'Aguinaldo — Junio 2026'].map((p, i) => ({
      periodo: p,
      bruto: bruto * (1 - i * 0.03),
      neto: bruto * (1 - i * 0.03) * 0.83,
      estado: i === 0 ? 'Liquidada' : 'Cerrada'
    })),
    vacHist: [
      { periodo: '2025', dias: 14, desde: '06/01/2025', hasta: '19/01/2025', estado: 'Aprobado' },
      { periodo: '2024', dias: 14, desde: '08/01/2024', hasta: '21/01/2024', estado: 'Aprobado' },
      { periodo: '2026', dias: 7, desde: '14/09/2026', hasta: '20/09/2026', estado: 'Pendiente' }
    ]
  };
}

export function generarSolicitudes(emps) {
  const g = rng(51000);
  const estados = ['Pendiente', 'En revisión', 'Aprobado', 'Rechazado', 'Cancelado'];
  const motivos = ['Descanso anual programado','Turno médico y reposo indicado','Trámite familiar','Examen final en la facultad','Mudanza de domicilio','Reposo por indicación médica'];
  const out = [];
  for (let i = 0; i < 22; i++) {
    const e = emps[g.int(0, emps.length - 1)];
    const dias = g.int(1, 14);
    const m = g.int(9, 11);
    const d1 = g.int(1, 18);
    out.push({
      id: 'SOL-' + (2600 + i * 7),
      emp: e,
      tipo: TIPOS_LICENCIA[g.int(0, TIPOS_LICENCIA.length - 1)],
      desde: d2(d1) + '/' + d2(m) + '/2026',
      hasta: d2(Math.min(28, d1 + dias)) + '/' + d2(m) + '/2026',
      dias,
      motivo: g.pick(motivos),
      obs: g.r() < 0.5 ? 'Cobertura ya coordinada con el encargado.' : 'Sin observaciones.',
      adjunto: g.r() < 0.45 ? 'certificado.pdf' : null,
      estado: i < 6 ? 'Pendiente' : i < 9 ? 'En revisión' : estados[g.int(2, 4)],
      etapa: i < 6 ? 'Supervisor' : i < 9 ? 'RRHH' : 'Cerrada',
      solicitado: d2(g.int(1, 3)) + '/09/2026'
    });
  }
  return out;
}

export function generarAdelantos(emps) {
  const g = rng(62000);
  const motivos = ['Gastos médicos familiares','Cuota escolar','Reparación del vehículo','Gastos imprevistos del hogar','Compra de electrodoméstico'];
  const out = [];
  for (let i = 0; i < 14; i++) {
    const e = emps[g.int(0, emps.length - 1)];
    const importe = g.int(80, 400) * 1000;
    const cuotas = g.pick([1, 1, 2, 3]);
    const estado = i < 4 ? 'Solicitado' : i < 6 ? 'En revisión' : i < 10 ? 'Aprobado' : g.pick(['Aplicado a liquidación', 'Rechazado']);
    out.push({
      id: 'ADL-' + (900 + i * 4),
      emp: e,
      fecha: d2(g.int(1, 3)) + '/09/2026',
      importe,
      cuotas,
      motivo: g.pick(motivos),
      obs: g.r() < 0.4 ? 'Solicita descuento en dos liquidaciones.' : '—',
      estado,
      descontado: estado === 'Aplicado a liquidación' ? importe : estado === 'Aprobado' ? Math.round(importe / cuotas) : 0
    });
  }
  return out;
}

export function generarIncidencias(emps, cat) {
  const g = rng(73000);
  const tipos = [
    { t: 'Falta de salida', d: 'Fichada de entrada sin salida registrada', tone: 'bad' },
    { t: 'Falta de entrada', d: 'Salida sin fichada de entrada', tone: 'bad' },
    { t: 'Llegada tarde', d: 'Ingreso posterior a la tolerancia configurada', tone: 'warn' },
    { t: 'Salida anticipada', d: 'Egreso antes del cierre de turno', tone: 'warn' },
    { t: 'Fichada duplicada', d: 'Dos lecturas en menos de 2 minutos', tone: 'info' },
    { t: 'Legajo sin coincidencia', d: 'ID del dispositivo no vinculado a un legajo', tone: 'bad' }
  ];
  const out = [];
  for (let i = 0; i < 11; i++) {
    const e = emps[g.int(0, emps.length - 1)];
    const it = tipos[i % tipos.length];
    out.push({
      id: 'INC-' + (400 + i * 3),
      emp: e,
      tipo: it.t,
      det: it.d,
      tone: it.tone,
      fecha: d2(g.int(1, 3)) + '/09/2026',
      disp: g.pick(cat.devices),
      punto: g.pick(cat.accessPoints)
    });
  }
  return out;
}
