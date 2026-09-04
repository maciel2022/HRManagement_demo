import { useEffect, useState } from 'react';
import { useSession } from '@/context/SessionContext';
import { capacitacionesApi, catalogoApi } from '@/api';
import { Avatar, Card, Chip, DataTable, Panel, ProgressBar } from '@/components/ui';

export default function Capacitaciones() {
  const { sucursal, rol, ctx, toastMsg, setRuta } = useSession();
  const [cursos, setCursos] = useState([]);
  const [cumpl, setCumpl] = useState([]);
  const [pend, setPend] = useState([]);

  useEffect(() => {
    capacitacionesApi.cursos({ sucursal, rol }).then(setCursos);
    capacitacionesApi.cumplimiento().then(setCumpl);
    capacitacionesApi.pendientes({ sucursal, rol }).then(setPend);
  }, [sucursal, rol]);

  const color = (pct) => (pct >= 80 ? '#1f7a4d' : pct >= 50 ? '#9a6a10' : '#a83232');

  return (
    <div className="flex flex-col gap-4">
      <Panel title="Cursos y cumplimiento">
        <DataTable
          rows={cursos}
          rowKey={(c) => c.id}
          columns={[
            { header: 'Curso', className: 'font-bold', cell: (c) => c.name },
            { header: 'Obligatorio', cell: (c) => (c.is_mandatory ? 'Sí' : 'No') },
            { header: 'Carga', mono: true, cell: (c) => c.duration_hours + ' h' },
            { header: 'Vigencia', cell: (c) => (c.validity_months ? c.validity_months + ' meses' : '—') },
            { header: 'Asignados', mono: true, cell: (c) => c.asignados },
            { header: 'Completados', mono: true, cell: (c) => c.completados },
            {
              header: 'Avance',
              width: 160,
              cell: (c) => (
                <div className="flex items-center gap-[9px]">
                  <ProgressBar pct={c.pct} color={color(c.pct)} />
                  <span className="font-mono text-[11px] font-bold">{c.pct}%</span>
                </div>
              )
            },
            {
              header: '',
              cell: (c) => (
                <button
                  className="px-[11px] py-[6px] border border-[#e2ded6] rounded-lg bg-surface text-xs font-bold text-brand hover:bg-brand-soft whitespace-nowrap"
                  onClick={async () => {
                    await capacitacionesApi.asignar(c.name, ctx);
                    toastMsg('Curso “' + c.name + '” asignado a los empleados pendientes.');
                  }}
                >
                  Asignar
                </button>
              )
            }
          ]}
        />
      </Panel>

      <div className="grid gap-4 items-start grid-cols-2">
        <Card className="px-5">
          <div className="text-[13.5px] font-bold mb-4">Cumplimiento por sucursal</div>
          {cumpl.map((s) => (
            <div key={s.sucursal} className="flex items-center gap-3 mb-3">
              <span className="w-[110px] shrink-0 text-[12.5px] font-bold">{catalogoApi.corta(s.sucursal)}</span>
              <ProgressBar pct={s.pct} color={color(s.pct)} height={9} />
              <span className="font-mono text-[11.5px] font-bold w-[34px] text-right">{s.pct}%</span>
              <Chip estado={s.pct >= 85 ? 'En regla' : s.pct >= 70 ? 'Atención' : 'Incumplimiento'} />
              <span className="font-mono text-[11px] text-[#8b8880]">{s.pendientes} pend.</span>
            </div>
          ))}
        </Card>

        <Panel title="Capacitación obligatoria pendiente">
          {pend.map((e) => (
            <div
              key={e.id}
              onClick={() => setRuta('empleados')}
              className="px-5 py-[11px] border-t border-canvas flex items-center gap-[11px] cursor-pointer hover:bg-[#faf9f7]"
            >
              <Avatar emp={e} size={30} />
              <span className="flex-1">
                <span className="block text-[12.5px] font-bold">{e.full}</span>
                <span className="block text-[11px] text-muted2">
                  {capacitacionesApi.cursoCritico()} · {catalogoApi.corta(e.suc)}
                </span>
              </span>
              <span className="font-mono text-[11.5px] font-bold text-bad">30/09/2026</span>
            </div>
          ))}
        </Panel>
      </div>
    </div>
  );
}
