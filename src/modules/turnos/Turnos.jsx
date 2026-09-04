import { useEffect, useMemo, useState } from 'react';
import { useSession } from '@/context/SessionContext';
import { turnosApi, catalogoApi } from '@/api';
import { Avatar, Card, Chip, FormFields, Icon, Modal, ModalFooter, Panel, ProgressBar, Tabs } from '@/components/ui';
import { TONOS } from '@/lib/format';
import { getDb } from '@/data/database';

const VISTAS = [
  { id: 'semana', label: 'Semanal' },
  { id: 'mes', label: 'Mensual' },
  { id: 'sucursal', label: 'Por sucursal' }
];

const DIAS = [
  ['Lun', '31/08'], ['Mar', '01/09'], ['Mié', '02/09'], ['Jue', '03/09'],
  ['Vie', '04/09'], ['Sáb', '05/09'], ['Dom', '06/09']
];

const TONO_TURNO = ['ok', 'info', 'vio', 'grey'];

const tonoTurno = (t, defs) => {
  if (t === 'Franco') return TONOS.grey;
  const i = defs.findIndex((d) => d.name === t);
  return TONOS[TONO_TURNO[i] ?? 'grey'];
};

export default function Turnos() {
  const { sucursal, rol, ctx, toastMsg } = useSession();
  const [vista, setVista] = useState('semana');
  const [emps, setEmps] = useState([]);
  const [cobertura, setCobertura] = useState([]);
  const [asignar, setAsignar] = useState(null);
  const db = getDb();
  const defs = turnosApi.definiciones();
  const rotables = defs.filter((d) => !d.rotating).map((d) => d.name);
  const DEFINICIONES = [
    ...defs
      .filter((d) => !d.rotating)
      .map((d, i) => ({ n: 'Turno ' + d.name, h: d.start_time + ' – ' + d.end_time, tone: TONO_TURNO[i] ?? 'grey' })),
    { n: 'Franco', h: 'Descanso semanal', tone: 'grey' }
  ];

  useEffect(() => {
    turnosApi.semana({ sucursal, rol }).then((r) => setEmps(r.slice(0, 16)));
    turnosApi.cobertura().then(setCobertura);
  }, [sucursal, rol]);

  const grilla = useMemo(
    () =>
      emps.map((e) => ({
        emp: e,
        cells: DIAS.map(([, fecha], i) => {
          const semilla = (e.id * 17 + i * 11) % 100;
          const turno =
            semilla < 16 ? 'Franco' : e.turno === 'Rotativo' ? rotables[semilla % rotables.length] : e.turno;
          return { turno, fecha };
        })
      })),
    [emps]
  );

  const conflictos = [
    { icon: 'error', tone: 'bad', l: db.branches[3].name + ' — Turno ' + rotables[rotables.length - 1] + ' del 05/09', d: 'Solo 2 personas asignadas sobre 3 requeridas. ' + db.emps[31].full + ' está de vacaciones.' },
    { icon: 'warning', tone: 'warn', l: 'Doble asignación', d: db.emps[8].full + ' figura en dos turnos del 04/09 (' + db.branches[0].name + ').' },
    { icon: 'warning', tone: 'warn', l: 'Descanso menor a 12 horas', d: db.emps[15].full + ' cierra Noche del 03/09 y abre Mañana del 04/09.' },
    { icon: 'info', tone: 'info', l: 'Cobertura temporaria activa', d: db.emps[22].full + ' cubre a ' + db.emps[23].full + ' (licencia médica) hasta el 08/09.' }
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-[10px] flex-wrap">
        <Tabs tabs={VISTAS} value={vista} onChange={setVista} />
        <div className="flex-1" />
        {DEFINICIONES.map((d) => (
          <span
            key={d.n}
            className="flex items-center gap-[7px] px-[11px] py-[6px] rounded-full text-[11.5px] font-bold"
            style={{ background: TONOS[d.tone].bg, color: TONOS[d.tone].fg }}
          >
            {d.n} <span className="font-mono opacity-80">{d.h}</span>
          </span>
        ))}
      </div>

      {vista === 'semana' && (
        <Panel title="Semana del 31/08 al 06/09/2026" subtitle="Tocá una celda para reasignar el turno">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs min-w-[900px]">
              <thead>
                <tr className="bg-[#faf9f7]">
                  <th className="th pl-5">Empleado</th>
                  {DIAS.map(([d, f]) => (
                    <th key={f} className="th text-center">
                      {d}
                      <br />
                      <span className="font-mono font-medium text-muted2">{f}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grilla.map(({ emp, cells }) => (
                  <tr key={emp.id} className="border-t border-canvas">
                    <td className="td pl-5 min-w-[230px]">
                      <div className="flex items-center gap-[9px]">
                        <Avatar emp={emp} size={28} radius={8} />
                        <span>
                          <span className="block font-bold">{emp.full}</span>
                          <span className="block text-[10.5px] text-muted2">
                            {emp.puesto} · {catalogoApi.corta(emp.suc)}
                          </span>
                        </span>
                      </div>
                    </td>
                    {cells.map((c, i) => {
                      const t = tonoTurno(c.turno, defs);
                      return (
                        <td key={i} className="px-[5px] py-[6px] text-center">
                          <button
                            onClick={() => setAsignar({ emp, dia: DIAS[i][0] + ' ' + c.fecha })}
                            className="w-full px-1 py-[7px] rounded-lg text-[11px] font-bold hover:brightness-95"
                            style={{ background: t.bg, color: t.fg }}
                          >
                            {c.turno}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {vista === 'mes' && (
        <Card className="p-[22px] overflow-x-auto">
          <div className="text-[13.5px] font-bold mb-1">Cobertura diaria — Septiembre 2026</div>
          <div className="text-xs text-[#8b8880] mb-4">Cada celda indica el nivel de cobertura de la unidad en el día</div>
          {db.branches.map((b) => (
            <div key={b.id} className="flex items-center gap-[10px] mb-2 min-w-[860px]">
              <span className="w-[130px] shrink-0 text-xs font-bold">{catalogoApi.corta(b.name)}</span>
              {Array.from({ length: 30 }, (_, i) => {
                const semilla = (b.id * 29 + i * 13) % 100;
                const t = semilla < 12 ? TONOS.bad : semilla < 32 ? TONOS.warn : TONOS.ok;
                return (
                  <span
                    key={i}
                    className="flex-1 text-center py-[7px] rounded-md font-mono text-[10px] font-bold"
                    style={{ background: t.bg, color: t.fg }}
                  >
                    {i + 1}
                  </span>
                );
              })}
            </div>
          ))}
        </Card>
      )}

      {vista === 'sucursal' && (
        <div className="grid gap-[14px] [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
          {cobertura.map((c) => {
            const ok = c.asignados >= c.requeridos;
            return (
              <Card key={c.sucursal + c.turno} className="px-[18px]">
                <div className="flex items-center justify-between gap-[10px] mb-[10px]">
                  <span className="text-[13px] font-bold">{catalogoApi.corta(c.sucursal)}</span>
                  <Chip estado={ok ? 'Cubierto' : 'Falta personal'} />
                </div>
                <div className="text-xs text-muted mb-[10px]">
                  Turno {c.turno} — {c.asignados} de {c.requeridos} requeridos
                </div>
                <ProgressBar pct={Math.min(100, Math.round((c.asignados / c.requeridos) * 100))} color={ok ? '#1f7a4d' : '#a83232'} />
              </Card>
            );
          })}
        </div>
      )}

      <Panel title="Conflictos y coberturas detectadas">
        {conflictos.map((c) => (
          <div key={c.l} className="px-5 py-[13px] border-t border-canvas flex gap-3 items-start">
            <span className="w-[30px] h-[30px] shrink-0 rounded-[9px] grid place-items-center" style={{ background: TONOS[c.tone].bg, color: TONOS[c.tone].fg }}>
              <Icon name={c.icon} size={17} />
            </span>
            <div>
              <div className="text-[12.5px] font-bold mb-[3px]">{c.l}</div>
              <div className="text-xs text-muted leading-[1.5]">{c.d}</div>
            </div>
          </div>
        ))}
      </Panel>

      {asignar && (
        <Modal
          icon="schedule"
          title="Asignar turno"
          subtitle={asignar.emp.full + ' — ' + asignar.dia}
          width={520}
          onClose={() => setAsignar(null)}
          footer={
            <ModalFooter
              confirmLabel="Asignar turno"
              onCancel={() => setAsignar(null)}
              onConfirm={async () => {
                await turnosApi.asignar(asignar.emp, asignar.dia, ctx);
                setAsignar(null);
                toastMsg('Turno asignado y notificado al empleado.');
              }}
            />
          }
        >
          <div className="grid grid-cols-1 gap-[14px]">
            <FormFields
              fields={[
                { label: 'Turno a asignar', type: 'select', span: true, options: [...catalogoApi.turnosConHorario(), 'Franco'] },
                { label: 'Motivo del cambio', type: 'select', span: true, options: ['Cobertura por ausencia', 'Reemplazo temporario', 'Rotación programada', 'Pedido del empleado'] },
                { label: 'Observaciones', type: 'textarea', span: true }
              ]}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
