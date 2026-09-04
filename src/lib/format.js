// Formato y tonos. La localización la inyecta ConfigProvider desde demo.config.js.

let LOC = { locale: 'es-AR', currency: 'ARS', currencySymbol: '$', dateFormat: 'DD/MM/YYYY', timeFormat: '24h' };

export function setLocalization(loc) {
  LOC = { ...LOC, ...loc };
}

export const localizacion = () => LOC;

export const ars = (n) => LOC.currencySymbol + ' ' + Math.round(n).toLocaleString(LOC.locale);

export const d2 = (n) => (n < 10 ? '0' + n : '' + n);

// Recibe una fecha ISO (AAAA-MM-DD) o un Date y la devuelve en el formato configurado.
export function fecha(v) {
  const d = v instanceof Date ? v : new Date(v + 'T00:00:00');
  const dd = d2(d.getDate());
  const mm = d2(d.getMonth() + 1);
  const yyyy = d.getFullYear();
  return LOC.dateFormat === 'MM/DD/YYYY' ? `${mm}/${dd}/${yyyy}` : `${dd}/${mm}/${yyyy}`;
}

export function hora(hhmm) {
  if (LOC.timeFormat !== '12h') return hhmm;
  const [h, m] = hhmm.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${d2(m)} ${ampm}`;
}

export const horas = (h) => (h ? h + ':00' : '—');

export const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);

export const TONOS = {
  ok: { fg: '#1f7a4d', bg: '#e7f3ec' },
  warn: { fg: '#9a6a10', bg: '#fbf1de' },
  bad: { fg: '#a83232', bg: '#fbeaea' },
  info: { fg: '#2f5fa8', bg: '#e9eff9' },
  vio: { fg: '#6b4a9e', bg: '#f0eaf9' },
  grey: { fg: '#6b6a63', bg: '#eeece7' },
  brand: { fg: 'var(--brand)', bg: 'var(--brand-soft)' }
};

const ESTADO_TONO = {
  Presente: 'ok', Activo: 'ok', Aprobado: 'ok', Aprobada: 'ok', Vigente: 'ok',
  Liquidada: 'ok', 'Aplicado a liquidación': 'ok', Completada: 'ok', 'En regla': 'ok', Cubierto: 'ok',
  Ausente: 'bad', Rechazado: 'bad', Vencido: 'bad', Injustificada: 'bad', Incumplimiento: 'bad', 'Falta personal': 'bad',
  Tarde: 'warn', 'Próximo a vencer': 'warn', Pendiente: 'warn', Solicitado: 'warn', Atención: 'warn', Ajustado: 'warn',
  'En revisión': 'info', 'En curso': 'info', Justificada: 'info', Vacaciones: 'info', Nacional: 'info',
  Licencia: 'vio', Feriado: 'vio', 'De la empresa': 'vio',
  Franco: 'grey', Cerrada: 'grey', Borrador: 'grey', Cancelado: 'grey', Baja: 'grey', 'No iniciada': 'grey'
};

export function tono(estado) {
  return TONOS[ESTADO_TONO[estado] || 'grey'];
}
