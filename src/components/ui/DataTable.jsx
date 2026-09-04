// Tabla reutilizable: recibe columnas + filas y no sabe nada del dominio.
export function DataTable({ columns, rows, rowKey, onRowClick, minWidth }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[12.5px]" style={minWidth ? { minWidth } : undefined}>
        <thead>
          <tr className="bg-surface2">
            {columns.map((c, i) => (
              <th
                key={c.key ?? i}
                className={'th ' + (i === 0 ? 'pl-5 ' : '') + (i === columns.length - 1 ? 'pr-5 ' : '') + (c.align === 'right' ? 'text-right ' : '')}
                style={c.width ? { width: c.width, minWidth: c.width } : undefined}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr
              key={rowKey ? rowKey(row, ri) : ri}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={'border-t border-canvas ' + (onRowClick ? 'cursor-pointer hover:bg-surface2' : '')}
            >
              {columns.map((c, ci) => (
                <td
                  key={c.key ?? ci}
                  className={
                    'td ' + (ci === 0 ? 'pl-5 ' : '') + (ci === columns.length - 1 ? 'pr-5 ' : '') +
                    (c.align === 'right' ? 'text-right ' : '') + (c.mono ? 'font-mono ' : '') + (c.className ?? '')
                  }
                >
                  {c.cell(row, ri)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
