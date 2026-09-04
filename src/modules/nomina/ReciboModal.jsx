import { Modal, ModalFooter } from '@/components/ui';
import { ars } from '@/lib/format';
import { detalleDe } from '@/data/database';

export default function ReciboModal({ emp, periodo, onClose, onConfirm }) {
  const d = detalleDe(emp);
  const rows = [
    ['Sueldo básico', '192:00', ars(emp.sueldo), ''],
    ['Antigüedad (' + emp.anios + ' años)', '', ars(emp.sueldo * 0.01 * emp.anios), ''],
    ['Horas extra al 50%', (emp.extras || 0) + ':00', ars(d.extraAmount), ''],
    ['Adicional nocturno', '', ars(d.nightAmount), ''],
    ['Presentismo', '', ars(emp.sueldo * 0.0833), ''],
    ['Jubilación 11%', '', '', ars(emp.sueldo * 0.11)],
    ['Ley 19.032 — 3%', '', '', ars(emp.sueldo * 0.03)],
    ['Obra social 3%', '', '', ars(emp.sueldo * 0.03)],
    ['Cuota sindical', '', '', ars(emp.sueldo * 0.02)],
    ['Adelanto de sueldo', '', '', ars(0)]
  ];

  return (
    <Modal
      icon="receipt_long"
      title="Recibo de sueldo"
      subtitle={periodo + ' — ' + emp.full}
      width={640}
      onClose={onClose}
      footer={<ModalFooter confirmLabel="Descargar PDF" onCancel={onClose} onConfirm={onConfirm} />}
    >
      <div className="grid grid-cols-2 gap-3 px-4 py-[15px] bg-surface2 border border-line2 rounded-xl mb-4">
        {[
          ['Empleado', emp.full],
          ['Legajo / CUIL', emp.legajo + ' · ' + emp.cuil],
          ['Puesto / Sucursal', emp.puesto + ' · ' + emp.suc],
          ['Período', periodo]
        ].map(([k, v]) => (
          <div key={k}>
            <div className="text-[10.5px] uppercase tracking-[.06em] text-muted2 font-bold">{k}</div>
            <div className="text-[13px] font-bold">{v}</div>
          </div>
        ))}
      </div>

      <table className="w-full border-collapse text-[12.5px]">
        <thead>
          <tr className="bg-surface2">
            <th className="th">Concepto</th>
            <th className="th">Cant.</th>
            <th className="th text-right">Remunerativo</th>
            <th className="th text-right">Descuentos</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([c, cant, rem, desc]) => (
            <tr key={c} className="border-t border-canvas">
              <td className="td font-semibold">{c}</td>
              <td className="td font-mono text-muted">{cant}</td>
              <td className="td font-mono text-right">{rem}</td>
              <td className="td font-mono text-right text-bad">{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end gap-6 px-3 pt-[15px] mt-2 border-t-2 border-surface3">
        {[
          ['Total bruto', ars(d.bruto), ''],
          ['Descuentos', '− ' + ars(d.aportes), 'text-bad'],
          ['Neto a cobrar', ars(d.neto), 'text-brand text-lg']
        ].map(([l, v, cls]) => (
          <div key={l} className="text-right">
            <div className="text-[10.5px] uppercase tracking-[.06em] text-muted2 font-bold">{l}</div>
            <div className={'font-mono text-[15px] font-extrabold ' + cls}>{v}</div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
