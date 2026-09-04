import { useMemo, useState } from 'react';
import { Chip, Icon, Modal } from '@/components/ui';
import { TONOS } from '@/lib/format';
import { asistenciaApi } from '@/api';
import { getDb } from '@/data/database';

const PASOS = ['Archivo', 'Vista previa', 'Mapeo', 'Validación', 'Advertencias', 'Confirmación'];

const MAPEO = [
  ['Employee ID', 'Legajo (vinculado por ID de dispositivo)'],
  ['Employee name', 'Nombre y apellido'],
  ['Date', 'Fecha (DD/MM/AAAA)'],
  ['Check-in time', 'Hora de entrada'],
  ['Check-out time', 'Hora de salida'],
  ['Device', 'Dispositivo'],
  ['Access point', 'Punto de acceso']
];

const VALIDACIONES = [
  { icon: 'check_circle', tone: 'ok', l: '248 registros con formato válido', d: 'Fechas y horarios interpretados correctamente.' },
  { icon: 'check_circle', tone: 'ok', l: '59 legajos vinculados', d: 'Coincidencia por ID de dispositivo Hikvision.' },
  { icon: 'error', tone: 'bad', l: '2 IDs sin legajo asociado', d: 'HK-2489 y HK-2502 no están vinculados a ningún empleado.' },
  { icon: 'warning', tone: 'warn', l: '6 fichadas sin salida', d: 'Se generarán incidencias para revisión manual.' },
  { icon: 'warning', tone: 'warn', l: '3 fichadas duplicadas', d: 'Se conservará la primera lectura de cada par.' }
];

const RESUMEN = [
  ['Registros a importar', '248'], ['Empleados afectados', '59'], ['Período', '01/09/2026 – 02/09/2026'],
  ['Horas trabajadas calculadas', '1.984:00'], ['Horas extra detectadas', '37:30'],
  ['Llegadas tarde', '9'], ['Salidas anticipadas', '4'], ['Incidencias a generar', '11']
];

export default function HikvisionWizard({ onClose, onConfirm }) {
  const [paso, setPaso] = useState(1);
  const dispositivo = asistenciaApi.dispositivos()[0];
  const puntoAcceso = asistenciaApi.puntosAcceso()[0];
  const filas = useMemo(
    () =>
      getDb()
        .emps.slice(0, 8)
        .map((e, i) => ({
          id: 'HK-' + (2400 + e.id),
          full: e.full,
          fecha: '02/09/2026',
          ent: i === 3 ? '06:34' : e.entrada !== '—' ? e.entrada : '05:58',
          sal: i === 5 ? '' : e.salida !== '—' ? e.salida : '14:11',
          disp: dispositivo,
          punto: puntoAcceso,
          hs: i === 5 ? '—' : '8:08',
          tarde: i === 3 ? '34 min' : '—',
          extra: i === 1 ? '1:00' : '—',
          alerta: i === 3 ? 'Llegada tarde' : i === 5 ? 'Falta fichada de salida' : '—',
          tone: i === 3 ? 'warn' : i === 5 ? 'bad' : 'ok'
        })),
    [dispositivo, puntoAcceso]
  );

  return (
    <Modal
      icon="upload_file"
      title="Importar fichadas Hikvision"
      subtitle={'Paso ' + paso + ' de 6'}
      width={820}
      onClose={onClose}
    >
      <div className="flex items-center gap-[6px] mb-5 flex-wrap">
        {PASOS.map((l, i) => {
          const n = i + 1;
          const activo = paso === n;
          const hecho = paso > n;
          return (
            <div key={l} className="flex items-center gap-[7px] pr-[6px]">
              <span
                className="w-[23px] h-[23px] rounded-full grid place-items-center text-[11px] font-extrabold font-mono"
                style={{
                  background: activo ? 'var(--brand)' : hecho ? 'var(--brand-soft)' : 'var(--surface-3)',
                  color: activo ? 'var(--brand-ink)' : hecho ? 'var(--brand)' : 'var(--muted-2)'
                }}
              >
                {n}
              </span>
              <span className="text-[11.5px] font-bold" style={{ color: paso >= n ? 'var(--ink)' : 'var(--muted-2)' }}>
                {l}
              </span>
            </div>
          );
        })}
      </div>

      {paso === 1 && (
        <div className="border-2 border-dashed border-linestrong rounded-[14px] p-10 text-center bg-surface2">
          <Icon name="cloud_upload" size={38} className="text-brand block mb-[10px]" />
          <div className="text-sm font-bold mb-[5px]">Arrastrá el archivo exportado del dispositivo Hikvision</div>
          <div className="text-[12.5px] text-muted mb-4">Formatos aceptados: .csv y .xlsx — hasta 5 MB</div>
          <div className="inline-flex items-center gap-[9px] px-[14px] py-[10px] bg-surface border border-linestrong rounded-[10px] text-[12.5px] font-bold">
            <Icon name="description" size={19} className="text-ok" />
            AccessControl_0109-0209.csv
            <span className="font-mono text-muted3 font-medium">248 filas · 61 KB</span>
          </div>
        </div>
      )}

      {paso === 2 && (
        <div className="border border-line rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-surface2">
                {['Employee ID', 'Employee name', 'Date', 'Check-in', 'Check-out', 'Device', 'Access point'].map((h) => (
                  <th key={h} className="th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filas.map((r) => (
                <tr key={r.id} className="border-t border-canvas">
                  <td className="td font-mono">{r.id}</td>
                  <td className="td font-semibold">{r.full}</td>
                  <td className="td font-mono">{r.fecha}</td>
                  <td className="td font-mono">{r.ent}</td>
                  <td className="td font-mono">{r.sal}</td>
                  <td className="td text-muted">{r.disp}</td>
                  <td className="td text-muted">{r.punto}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {paso === 3 && (
        <div className="flex flex-col gap-[9px]">
          {MAPEO.map(([csv, campo]) => (
            <div key={csv} className="flex items-center gap-3 px-[14px] py-[11px] border border-line rounded-[11px]">
              <span className="font-mono text-xs font-semibold w-[150px] shrink-0">{csv}</span>
              <Icon name="arrow_forward" size={18} className="text-muted2" />
              <span className="flex-1 text-[12.5px] font-bold text-brand">{campo}</span>
              <Icon name="check_circle" size={18} className="text-ok" />
            </div>
          ))}
        </div>
      )}

      {paso === 4 && (
        <div className="flex flex-col gap-[9px]">
          {VALIDACIONES.map((v) => (
            <div key={v.l} className="flex gap-3 px-[14px] py-3 rounded-[11px]" style={{ background: TONOS[v.tone].bg }}>
              <Icon name={v.icon} size={20} style={{ color: TONOS[v.tone].fg }} />
              <span>
                <span className="block text-[12.5px] font-bold" style={{ color: TONOS[v.tone].fg }}>{v.l}</span>
                <span className="block text-xs text-ink2 mt-[2px]">{v.d}</span>
              </span>
            </div>
          ))}
        </div>
      )}

      {paso === 5 && (
        <div className="border border-line rounded-xl overflow-hidden">
          <div className="px-[15px] py-3 bg-surface2 border-b border-line2 text-[12.5px] font-bold">
            Cálculos automáticos y advertencias por registro
          </div>
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr>
                {['Empleado', 'Horas', 'Tarde', 'Extras', 'Advertencia'].map((h) => (
                  <th key={h} className="th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filas.map((r) => (
                <tr key={r.id} className="border-t border-canvas">
                  <td className="td font-semibold">{r.full}</td>
                  <td className="td font-mono">{r.hs}</td>
                  <td className="td font-mono">{r.tarde}</td>
                  <td className="td font-mono">{r.extra}</td>
                  <td className="td"><Chip tone={TONOS[r.tone]}>{r.alerta}</Chip></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {paso === 6 && (
        <div className="grid grid-cols-2 gap-3">
          {RESUMEN.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between gap-[10px] px-[14px] py-3 bg-surface2 border border-line2 rounded-[11px]">
              <span className="text-[12.5px] font-semibold text-ink2">{k}</span>
              <span className="font-mono text-sm font-extrabold">{v}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-[10px] mt-5 pt-4 border-t border-line2">
        <button className="btn-ghost" onClick={() => setPaso((p) => Math.max(1, p - 1))}>
          Atrás
        </button>
        <div className="flex-1" />
        <button className="btn-ghost" onClick={onClose}>
          Cancelar
        </button>
        <button className="btn-primary" onClick={() => (paso === 6 ? onConfirm() : setPaso((p) => p + 1))}>
          {paso === 6 ? 'Confirmar importación' : 'Continuar'}
        </button>
      </div>
    </Modal>
  );
}
