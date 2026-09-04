import { Icon } from './primitives';
import { TONOS } from '@/lib/format';

export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="flex gap-1 p-[5px] bg-[#efeee9] rounded-[11px] overflow-x-auto flex-wrap">
      {tabs.map((t) => {
        const on = value === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={
              'whitespace-nowrap px-[13px] py-2 rounded-lg text-[12.5px] font-bold border ' +
              (on ? 'bg-surface border-line text-brand' : 'bg-transparent border-transparent text-muted hover:bg-[#f2f0ec]')
            }
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

export function KpiCard({ label, value, sub, icon, tone = 'brand' }) {
  const t = TONOS[tone];
  return (
    <div className="card px-4 py-[15px] flex flex-col gap-[9px]">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11.5px] font-bold text-muted leading-tight">{label}</span>
        {icon && (
          <span className="w-[30px] h-[30px] rounded-[9px] grid place-items-center shrink-0" style={{ background: t.bg, color: t.fg }}>
            <Icon name={icon} size={18} />
          </span>
        )}
      </div>
      <div className="font-mono text-3xl font-extrabold tracking-[-1px] leading-none">{value}</div>
      {sub && <div className="text-[11.5px] text-muted2 font-semibold">{sub}</div>}
    </div>
  );
}

export function StatCard({ label, value, tone = 'grey' }) {
  const t = TONOS[tone];
  return (
    <div className="card px-4 py-[14px]">
      <div className="text-[11.5px] font-bold text-muted mb-2">{label}</div>
      <div
        className="inline-block font-mono text-[22px] font-extrabold px-[11px] py-[2px] rounded-[9px]"
        style={{ background: t.bg, color: t.fg }}
      >
        {value}
      </div>
    </div>
  );
}
