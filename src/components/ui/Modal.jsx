import { Icon } from './primitives';

export function Modal({ icon = 'edit', title, subtitle, width = 560, onClose, children, footer }) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[150] bg-[rgba(38,37,33,.42)] backdrop-blur-[3px] flex items-start justify-center px-5 py-12 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full bg-surface rounded-2xl shadow-2xl animate-pop overflow-hidden"
        style={{ maxWidth: width }}
      >
        <div className="px-[22px] py-[18px] border-b border-line2 flex items-center gap-3">
          <Icon name={icon} size={22} className="text-brand" />
          <div className="flex-1">
            <div className="text-base font-bold tracking-[-.2px]">{title}</div>
            {subtitle && <div className="text-xs text-muted mt-[2px]">{subtitle}</div>}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-[#f2f0ec] hover:bg-line grid place-items-center" aria-label="Cerrar">
            <Icon name="close" size={19} className="text-ink2" />
          </button>
        </div>
        <div className="px-[22px] pt-5 pb-[22px]">
          {children}
          {footer}
        </div>
      </div>
    </div>
  );
}

export function ModalFooter({ onCancel, onConfirm, confirmLabel = 'Confirmar' }) {
  return (
    <div className="flex items-center gap-[10px] mt-5 pt-4 border-t border-line2">
      <div className="flex-1" />
      <button className="btn-ghost" onClick={onCancel}>
        Cancelar
      </button>
      <button className="btn-primary" onClick={onConfirm}>
        {confirmLabel}
      </button>
    </div>
  );
}

export function Field({ label, span, children }) {
  return (
    <label className="block" style={span ? { gridColumn: '1 / -1' } : undefined}>
      <span className="label">{label}</span>
      {children}
    </label>
  );
}

// Formulario declarativo: [{ label, type, options, placeholder, span, value, readOnly }]
export function FormFields({ fields }) {
  return (
    <div className="grid grid-cols-2 gap-[14px]">
      {fields.map((f) => (
        <Field key={f.label} label={f.label} span={f.span}>
          {f.type === 'select' ? (
            <select className="input" defaultValue={f.value}>
              {f.options.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          ) : f.type === 'textarea' ? (
            <textarea rows={f.rows ?? 3} className="input resize-y" placeholder={f.placeholder} />
          ) : (
            <input
              className={'input ' + (f.dashed ? 'border-dashed ' : '') + (f.readOnly ? 'bg-[#f2f0ec] font-mono ' : '')}
              placeholder={f.placeholder}
              defaultValue={f.value}
              readOnly={f.readOnly}
            />
          )}
        </Field>
      ))}
    </div>
  );
}
