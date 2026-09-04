import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useSession } from '@/context/SessionContext';
import { moduloPorId } from '@/modules/registry';
import { Toast } from '@/components/ui';
import { HOY } from '@/data/catalogos';

export default function AppShell() {
  const { ruta, toast } = useSession();
  const [accion, setAccion] = useState(null); // acción rápida disparada desde el topbar
  const modulo = moduloPorId(ruta);
  const Modulo = modulo.Component;

  return (
    <div className="flex items-stretch min-h-screen bg-canvas">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar onQuickAction={(k) => setAccion({ k, n: Date.now() })} />
        <main className="flex-1 px-[26px] pt-[26px] pb-16 min-w-0">
          <div className="flex items-end justify-between gap-5 mb-[22px]">
            <div>
              <h1 className="m-0 mb-[5px] text-[25px] font-extrabold tracking-[-.5px]">{modulo.titulo}</h1>
              <p className="m-0 text-[13px] text-muted">{modulo.sub}</p>
            </div>
            <div className="font-mono text-xs text-muted3 whitespace-nowrap">{HOY.largo}</div>
          </div>
          <div className="min-w-0 animate-fade" key={ruta}>
            <Modulo accion={accion} onAccionConsumida={() => setAccion(null)} />
          </div>
        </main>
      </div>
      <Toast message={toast} />
    </div>
  );
}
