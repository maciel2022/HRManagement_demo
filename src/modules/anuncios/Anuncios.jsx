import { useEffect, useState } from 'react';
import { useSession } from '@/context/SessionContext';
import { anunciosApi, catalogoApi } from '@/api';
import { EmptyState, FormFields, Icon, Modal, ModalFooter } from '@/components/ui';
import { TONOS } from '@/lib/format';

const tonoPrioridad = (p) => (p === 'Alta' ? TONOS.bad : p === 'Media' ? TONOS.warn : TONOS.info);

export default function Anuncios({ accion, onAccionConsumida }) {
  const { ctx, toastMsg, can } = useSession();
  const [items, setItems] = useState([]);
  const [leidos, setLeidos] = useState({});
  const [selId, setSelId] = useState(null);
  const [nuevo, setNuevo] = useState(false);

  useEffect(() => {
    anunciosApi.list().then(setItems);
  }, []);

  useEffect(() => {
    if (accion?.k === 'nuevoAnuncio') {
      setNuevo(true);
      onAccionConsumida?.();
    }
  }, [accion]);

  const sel = items.find((i) => i.id === selId);
  const sinLeer = items.filter((i) => !leidos[i.id]).length;

  return (
    <div className="grid gap-4 items-start grid-cols-2">
      <div className="flex flex-col gap-3">
        <div className="card flex items-center gap-[10px] px-[15px] py-3">
          <span className="font-mono text-xs text-muted3">{sinLeer} sin leer</span>
          <div className="flex-1" />
          <button
            className="btn-ghost"
            onClick={() => {
              setLeidos(Object.fromEntries(items.map((i) => [i.id, true])));
              toastMsg('Todos los anuncios marcados como leídos.');
            }}
          >
            Marcar leídos
          </button>
          {can('announcements', 'create') && (
            <button className="btn-primary" onClick={() => setNuevo(true)}>
              <Icon name="campaign" size={17} /> Publicar
            </button>
          )}
        </div>

        {items.map((a) => {
          const t = tonoPrioridad(a.priority);
          const leido = !!leidos[a.id];
          return (
            <div
              key={a.id}
              onClick={async () => {
                setSelId(a.id);
                setLeidos((l) => ({ ...l, [a.id]: true }));
                await anunciosApi.marcarLeido(a.id, ctx);
              }}
              className="bg-surface rounded-[13px] px-[17px] py-[15px] cursor-pointer hover:bg-surface2"
              style={{ border: '1.5px solid ' + (selId === a.id ? 'var(--brand)' : 'var(--line)') }}
            >
              <div className="flex items-center gap-[10px] mb-[7px]">
                <span className="w-[7px] h-[7px] rounded-full" style={{ background: leido ? 'transparent' : 'var(--bad-fg)' }} />
                <span className={'flex-1 text-[13.5px] ' + (leido ? 'font-semibold' : 'font-extrabold')}>{a.title}</span>
                <span className="chip" style={{ background: t.bg, color: t.fg }}>
                  {a.priority}
                </span>
              </div>
              <div className="text-[12.5px] text-muted leading-[1.5] mb-[9px] text-pretty">{a.body}</div>
              <div className="flex gap-[14px] font-mono text-[10.5px] text-muted2">
                <span>{a.audience}</span>
                <span>{a.published_at}</span>
                <span>{a.author}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div>
        {sel ? (
          <div className="card p-[26px] sticky top-[90px]">
            <div className="flex items-center gap-[10px] mb-[14px]">
              <Icon name="campaign" size={22} className="text-brand" />
              <span className="text-[11px] uppercase tracking-[.07em] text-muted2 font-bold">
                Prioridad {sel.priority} · {sel.audience}
              </span>
            </div>
            <h2 className="m-0 mb-3 text-[21px] font-extrabold tracking-[-.4px] leading-tight">{sel.title}</h2>
            <div className="text-sm leading-[1.7] text-ink2 text-pretty">{sel.body}</div>
            <div className="mt-5 pt-4 border-t border-line2 flex gap-5 font-mono text-[11.5px] text-muted3">
              <span>Publicado {sel.published_at}</span>
              <span>Autor: {sel.author}</span>
            </div>
          </div>
        ) : (
          <EmptyState icon="drafts" title="Seleccioná un anuncio para leerlo" body="Al abrirlo se marca como leído." />
        )}
      </div>

      {nuevo && (
        <Modal
          icon="campaign"
          title="Publicar anuncio interno"
          subtitle="Definí el alcance y la prioridad del comunicado"
          width={640}
          onClose={() => setNuevo(false)}
          footer={
            <ModalFooter
              confirmLabel="Publicar"
              onCancel={() => setNuevo(false)}
              onConfirm={async () => {
                await anunciosApi.create({}, ctx);
                setNuevo(false);
                toastMsg('Anuncio publicado a la red.');
              }}
            />
          }
        >
          <FormFields
            fields={[
              { label: 'Título *', span: true, placeholder: 'Ej.: Nuevo procedimiento de cierre de caja' },
              {
                label: 'Alcance',
                type: 'select',
                options: ['Toda la empresa', ...catalogoApi.sucursalesNombres(), 'Área específica', 'Grupo de empleados']
              },
              { label: 'Prioridad', type: 'select', options: ['Alta', 'Media', 'Informativa'] },
              { label: 'Mensaje *', type: 'textarea', span: true, rows: 5, placeholder: 'Escribí el comunicado…' }
            ]}
          />
        </Modal>
      )}
    </div>
  );
}
