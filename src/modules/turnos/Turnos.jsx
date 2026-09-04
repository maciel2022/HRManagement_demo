import { useEffect, useMemo, useState } from 'react';
import { useSession } from '@/context/SessionContext';
import { turnosApi, catalogoApi } from '@/api';
import { Avatar, Card, Chip, FilterBar, FormFields, Icon, Modal, ModalFooter, Panel, ProgressBar, Select, Tabs } from '@/components/ui';
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
  const { sucursal, rol, ctx, toastMsg, filtros, setFiltros, resetFiltros } = useSession();
  // La cobertura por sucursal es la vista natural del módulo: los turnos se
  // dotan por unidad operativa, no sobre la red entera.
  const [vista, setVista] = useState('sucursal');
  const [emps, setEmps] = useState([]);
  const [cobertura, setCobertura] = useState([]);
  const [conteos, setConteos] = useState(null);
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

  const consulta = { sucursal, rol, area: filtros.area, puesto: filtros.puesto, turno: filtros.turno };

  useEffect(() => {
    turnosApi.semana({ sucursal, rol }).then((r) => setEmps(r.slice(0, 16)));
  }, [sucursal, rol]);

  useEffect(() => {
    turnosApi.cobertura(consulta).then(setCobertura);
    turnosApi.conteos(consulta).then(setConteos);
  }, [sucursal, rol, filtros.area, filtros.puesto, filtros.turno]);

  const areasOpt = ['Todas', ...catalogoApi.areasOperativas()];
  // El puesto se acota al área elegida: sin área, se ofrecen todos.
  const puestosOpt = ['Todos', ...catalogoApi.puestosNombres(filtros.area)];
  const turnosOpt = ['Todos', ...defs.filter((d) => !d.rotating).map((d) => d.name)];

  // Cambiar de área invalida el puesto elegido si ya no pertenece a ella.
  const cambiarArea = (area) => {
    const sigueValiendo = area === 'Todas' || catalogoApi.puestosNombres(area).includes(filtros.puesto);
    setFiltros({ area, puesto: sigueValiendo ? filtros.puesto : 'Todos' });
  };

  const estadoDotacion = (asignados, requeridos) => {
    if (requeridos === 0) return { label: 'Sin dotación definida', tone: TONOS.grey };
    if (asignados === requeridos) return { label: 'Dotación completa', tone: TONOS.ok };
    if (asignados < requeridos) return { label: 'Faltan ' + (requeridos - asignados), tone: TONOS.bad };
    return { label: 'Sobredotación +' + (asignados - requeridos), tone: TONOS.warn };
  };

  // El faltante se suma por área, no con el neto del turno: un playero de más no
  // cubre a un cajero que falta, y con el neto una ficha podía decir "Dotación
  // completa" mientras el desglose mostraba un área en cero.
  // Sin faltantes el turno está cubierto: tener gente de más es cobertura, no un
  // problema. La sobredotación se avisa sólo cuando es significativa.
  const EXCESO_AVISO = 2;
  const estadoTurno = (porArea) => {
    if (!porArea.length) return { label: 'Sin dotación definida', tone: TONOS.grey };
    const cortas = porArea.filter((a) => a.asignados < a.requeridos);
    const faltan = cortas.reduce((n, a) => n + (a.requeridos - a.asignados), 0);
    // El chip dice DÓNDE falta: el total del turno puede cuadrar (3/3) mientras
    // falta un playero y sobra un cajero, y ahí "Faltan 1" parecería un error.
    if (faltan)
      return {
        label: 'Faltan ' + faltan + (cortas.length === 1 ? ' en ' + cortas[0].area : ' en ' + cortas.length + ' áreas'),
        tone: TONOS.bad
      };
    const exceso = porArea.reduce((n, a) => n + a.asignados - a.requeridos, 0);
    if (exceso >= EXCESO_AVISO) return { label: 'Sobredotación +' + exceso, tone: TONOS.warn };
    return { label: 'Dotación completa', tone: TONOS.ok };
  };

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
      <FilterBar
        right={
          <button
            className="btn-ghost"
            onClick={() => {
              resetFiltros();
              toastMsg('Filtros restablecidos');
            }}
          >
            Limpiar
          </button>
        }
      >
        <span className="text-xs font-bold text-ink2 mr-1">Filtros</span>
        <Select value={filtros.area} onChange={cambiarArea} options={areasOpt} prefix="Área" />
        <Select value={filtros.puesto} onChange={(v) => setFiltros({ puesto: v })} options={puestosOpt} prefix="Puesto" />
        <Select value={filtros.turno} onChange={(v) => setFiltros({ turno: v })} options={turnosOpt} prefix="Turno" />
      </FilterBar>

      {conteos && (
        <div data-test="contadores" className="flex items-stretch gap-[10px] flex-wrap">
          <div className="card px-[15px] py-[11px] flex flex-col justify-center min-w-[122px]">
            <span className="text-[10.5px] uppercase tracking-[.06em] text-muted3 font-bold">Personal</span>
            <span className="text-[19px] font-extrabold leading-tight">{conteos.total}</span>
          </div>
          {conteos.items.map((c) => (
            <div
              key={c.label}
              data-test="contador"
              className="card px-[15px] py-[11px] flex flex-col justify-center min-w-[122px]"
            >
              <span className="text-[11px] text-muted font-semibold truncate">{c.label}</span>
              <span className="text-[17px] font-extrabold leading-tight">{c.total}</span>
            </div>
          ))}
          {!conteos.items.length && (
            <div className="card px-[15px] py-[11px] text-xs text-muted">
              Ningún empleado coincide con los filtros.
            </div>
          )}
        </div>
      )}

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
                <tr className="bg-surface2">
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
          <div className="text-xs text-muted3 mb-4">Cada celda indica el nivel de cobertura de la unidad en el día</div>
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
        <div
          data-test="cobertura"
          className="grid gap-[14px] [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]"
        >
          {cobertura.map((c) => {
            const est = estadoTurno(c.porArea);
            const pct = c.requeridos ? Math.min(100, Math.round((c.asignados / c.requeridos) * 100)) : 100;
            return (
              <Card key={c.sucursal + c.turno} className="px-[18px]">
                <div className="flex items-center justify-between gap-[10px] mb-[10px]">
                  <span className="text-[13px] font-bold">{catalogoApi.corta(c.sucursal)}</span>
                  <Chip tone={est.tone}>{est.label}</Chip>
                </div>
                <div className="flex items-baseline gap-[7px] mb-[9px]">
                  <span className="text-xs text-muted">
                    Turno {c.turno}
                    {c.horario && <span className="font-mono text-muted2"> · {c.horario}</span>}
                  </span>
                  <div className="flex-1" />
                  <span className="font-mono text-[13px] font-extrabold" style={{ color: est.tone.fg }}>
                    {c.asignados} / {c.requeridos}
                  </span>
                </div>
                <ProgressBar pct={pct} color={est.tone.fg} />
                {c.porArea.length > 0 && (
                  <div className="mt-[13px] pt-[11px] border-t border-line2 flex flex-col gap-[6px]">
                    {c.porArea.map((a) => {
                      const e = estadoDotacion(a.asignados, a.requeridos);
                      return (
                        <div key={a.area} className="flex items-center gap-2 text-[11.5px]">
                          <span className="flex-1 truncate text-ink2 font-semibold">{a.area}</span>
                          <span className="font-mono font-bold" style={{ color: e.tone.fg }}>
                            {a.asignados} / {a.requeridos}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })}
          {!cobertura.length && (
            <Card className="px-[18px] text-xs text-muted">
              Ningún turno coincide con los filtros seleccionados.
            </Card>
          )}
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
