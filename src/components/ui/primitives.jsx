import { tono } from '@/lib/format';

export function Icon({ name, className = '', size = 20, style }) {
  return (
    <span className={'ms ' + className} style={{ fontSize: size, ...style }} aria-hidden="true">
      {name}
    </span>
  );
}

export function Chip({ estado, children, tone }) {
  const t = tone ?? tono(estado);
  return (
    <span className="chip" style={{ background: t.bg, color: t.fg }}>
      {children ?? estado}
    </span>
  );
}

export function Avatar({ emp, size = 32, radius = 9 }) {
  return (
    <span
      className="grid place-items-center font-extrabold shrink-0"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: emp.bg,
        color: emp.fg,
        fontSize: Math.round(size * 0.36)
      }}
    >
      {emp.ini}
    </span>
  );
}

export function Card({ children, className = '', pad = true }) {
  return <div className={'card ' + (pad ? 'p-[17px] ' : '') + className}>{children}</div>;
}

export function Panel({ title, subtitle, right, children, bodyClassName = '' }) {
  return (
    <div className="card overflow-hidden">
      {(title || right) && (
        <div className="px-5 py-[15px] border-b border-line2 flex items-center gap-3 flex-wrap">
          <div>
            {title && <div className="text-[13.5px] font-bold">{title}</div>}
            {subtitle && <div className="text-xs text-muted mt-[3px]">{subtitle}</div>}
          </div>
          <div className="flex-1" />
          {right}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </div>
  );
}

export function ProgressBar({ pct, color = '#12665c', height = 8 }) {
  return (
    <div className="flex-1 rounded-md overflow-hidden bg-[#f2f0ec]" style={{ height }}>
      <div className="h-full rounded-md" style={{ width: pct + '%', background: color }} />
    </div>
  );
}

export function BarList({ items, color = '#12665c', labelWidth = 100 }) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <div className="flex flex-col gap-[9px]">
      {items.map((i) => (
        <div key={i.label} className="flex items-center gap-[10px]">
          <span className="text-[11.5px] font-semibold text-ink2 shrink-0" style={{ width: labelWidth }}>
            {i.label}
          </span>
          <ProgressBar pct={Math.round((i.value / max) * 100)} color={i.color ?? color} />
          <span className="font-mono text-[11.5px] font-semibold w-6 text-right">{i.value}</span>
        </div>
      ))}
    </div>
  );
}

export function ColumnChart({ title, subtitle, items, color = '#1f7a4d' }) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <Card className="px-[18px]">
      <div className="text-[13px] font-bold">{title}</div>
      {subtitle && <div className="text-[11.5px] text-[#8b8880] mb-4">{subtitle}</div>}
      <div className="flex items-end gap-[9px] h-[108px]">
        {items.map((i) => (
          <div key={i.label} className="flex-1 flex flex-col items-center justify-end gap-[6px] h-full">
            <span className="font-mono text-[10.5px] font-semibold text-ink2">{i.value}</span>
            <span
              className="w-full rounded-t-md opacity-85"
              style={{ height: Math.round((i.value / max) * 100) + '%', background: color }}
            />
            <span className="text-[10px] text-muted2 font-semibold">{i.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function EmptyState({ icon = 'inbox', title, body, tone = '#a5a29a' }) {
  return (
    <div className="bg-surface border border-dashed border-[#cfcac1] rounded-[14px] p-11 text-center">
      <Icon name={icon} size={34} className="block mb-[10px]" style={{ color: tone }} />
      <div className="text-sm font-bold">{title}</div>
      {body && <div className="text-[12.5px] text-muted mt-1">{body}</div>}
    </div>
  );
}

export function Toast({ message }) {
  if (!message) return null;
  return (
    <div className="fixed right-6 bottom-6 z-[200] flex items-center gap-[11px] px-[17px] py-[13px] bg-ink text-white rounded-xl shadow-2xl text-[13px] font-semibold animate-pop max-w-[380px]">
      <Icon name="check_circle" size={19} style={{ color: '#7fd1b9' }} />
      {message}
    </div>
  );
}

export function FilterBar({ children, right }) {
  return (
    <div className="card flex items-center gap-[10px] flex-wrap px-[15px] py-[13px]">
      <Icon name="filter_alt" size={19} className="text-[#8b8880]" />
      {children}
      <div className="flex-1" />
      {right}
    </div>
  );
}

export function Select({ value, onChange, options, prefix, className = '' }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={
        'px-[10px] py-[7px] border border-[#e2ded6] rounded-lg bg-[#faf9f7] text-[12.5px] font-semibold cursor-pointer ' +
        className
      }
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {prefix ? prefix + ': ' + o : o}
        </option>
      ))}
    </select>
  );
}
