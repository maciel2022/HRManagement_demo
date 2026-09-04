import { useEffect, useState } from 'react';
import { useSession } from '@/context/SessionContext';
import { desempenoApi, catalogoApi } from '@/api';
import { Avatar, Card, Chip, Panel, ProgressBar } from '@/components/ui';

const ESCALA = [
  ['5', 'Excede lo esperado'],
  ['4', 'Supera parcialmente'],
  ['3', 'Cumple'],
  ['2', 'Necesita mejorar'],
  ['1', 'No cumple']
];

const HISTORIAL = [
  { periodo: '1° semestre 2026', prom: '4,2', estado: 'Aprobado' },
  { periodo: '2° semestre 2025', prom: '3,8', estado: 'Aprobado' },
  { periodo: '1° semestre 2025', prom: '3,5', estado: 'Aprobado' }
];

export default function Desempeno() {
  const { sucursal, rol, ctx, toastMsg } = useSession();
  const [items, setItems] = useState([]);
  const [selId, setSelId] = useState(null);

  useEffect(() => {
    desempenoApi.list({ sucursal, rol }).then((r) => {
      setItems(r);
      setSelId((s) => s ?? r[0]?.emp.id ?? null);
    });
  }, [sucursal, rol]);

  const sel = items.find((i) => i.emp.id === selId) ?? items[0];
  if (!sel) return null;

  return (
    <div className="grid gap-4 items-start [grid-template-columns:1.1fr_1fr]">
      <Panel
        title="Evaluaciones 1° semestre 2026"
        right={
          <button
            className="btn-primary"
            onClick={async () => {
              await desempenoApi.create(ctx);
              toastMsg('Evaluación creada en estado borrador.');
            }}
          >
            Nueva evaluación
          </button>
        }
      >
        {items.map(({ emp, detalle }) => {
          const estado = detalle.prom >= 4 ? 'Aprobado' : detalle.prom >= 3 ? 'En revisión' : 'Pendiente';
          return (
            <div
              key={emp.id}
              onClick={() => setSelId(emp.id)}
              className={
                'px-5 py-3 border-t border-canvas flex items-center gap-3 cursor-pointer hover:bg-[#faf9f7] ' +
                (sel.emp.id === emp.id ? 'bg-[#faf9f7]' : '')
              }
            >
              <Avatar emp={emp} />
              <span className="flex-1 min-w-0">
                <span className="block text-[12.5px] font-bold">{emp.full}</span>
                <span className="block text-[11px] text-muted2">
                  {emp.puesto} · {catalogoApi.corta(emp.suc)} · evalúa {emp.sup}
                </span>
              </span>
              <span className="w-[90px] shrink-0">
                <ProgressBar pct={Math.round((detalle.prom / 5) * 100)} height={7} />
              </span>
              <span className="font-mono text-[12.5px] font-extrabold w-[30px] text-right">
                {detalle.prom.toFixed(1)}
              </span>
              <Chip estado={estado} />
            </div>
          );
        })}
      </Panel>

      <div className="flex flex-col gap-4">
        <Card className="p-[22px]">
          <div className="flex items-center gap-[13px] mb-[18px]">
            <Avatar emp={sel.emp} size={44} radius={12} />
            <div className="flex-1">
              <div className="text-[15px] font-extrabold">{sel.emp.full}</div>
              <div className="text-xs text-muted">
                {sel.emp.puesto} · {sel.emp.suc}
              </div>
            </div>
            <span className="font-mono text-sm font-extrabold px-3 py-[5px] rounded-[9px] bg-brand-soft text-brand">
              {sel.detalle.prom.toFixed(1)} / 5
            </span>
          </div>
          {sel.detalle.comps.map((c) => (
            <div key={c.n} className="flex items-center gap-3 mb-[10px]">
              <span className="w-[185px] shrink-0 text-[12.5px] font-semibold">{c.n}</span>
              <ProgressBar pct={c.pct} height={9} />
              <span className="font-mono text-[11.5px] font-bold w-[30px] text-right">{c.label}</span>
            </div>
          ))}
          <div className="mt-[18px] pt-4 border-t border-line2">
            <div className="text-[11px] uppercase tracking-[.07em] text-muted2 font-bold mb-[6px]">
              Comentario del supervisor
            </div>
            <div className="text-[13px] leading-[1.55] mb-[14px] text-pretty">{sel.detalle.comentarioSup}</div>
            <div className="text-[11px] uppercase tracking-[.07em] text-muted2 font-bold mb-[6px]">
              Comentario del empleado
            </div>
            <div className="text-[13px] leading-[1.55] text-pretty">{sel.detalle.comentarioEmp}</div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="px-5">
            <div className="text-[13px] font-bold mb-[13px]">Objetivos</div>
            {sel.detalle.objetivos.map((o) => (
              <div key={o.n} className="mb-3">
                <div className="flex justify-between gap-2 text-xs font-semibold mb-[5px]">
                  <span>{o.n}</span>
                  <span className="font-mono text-muted">{o.prog}%</span>
                </div>
                <ProgressBar pct={o.prog} color="#2f5fa8" height={7} />
              </div>
            ))}
          </Card>
          <Card className="px-5">
            <div className="text-[13px] font-bold mb-[13px]">Escala de calificación</div>
            {ESCALA.map(([n, l]) => (
              <div key={n} className="flex items-center gap-[10px] py-[5px]">
                <span className="w-[22px] h-[22px] rounded-[7px] bg-brand-soft text-brand font-mono text-[11px] font-extrabold grid place-items-center">
                  {n}
                </span>
                <span className="text-[12.5px] font-semibold">{l}</span>
              </div>
            ))}
            <div className="mt-[14px] pt-[13px] border-t border-line2">
              <div className="text-[11px] uppercase tracking-[.07em] text-muted2 font-bold mb-2">Historial</div>
              {HISTORIAL.map((h) => (
                <div key={h.periodo} className="flex items-center gap-2 py-1 text-xs">
                  <span className="flex-1 font-semibold">{h.periodo}</span>
                  <span className="font-mono font-bold">{h.prom}</span>
                  <Chip estado={h.estado} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
