import { useEditorStore } from '../../store/editorStore'

export default function DataTable() {
  const dataSource = useEditorStore((s) => s.dataSource)
  if (!dataSource) return null

  const previewRows = dataSource.records.slice(0, 10)

  return (
    <div>
      <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
        Preview (first {Math.min(10, dataSource.records.length)} rows)
      </h4>
      <div className="border border-gray-200 rounded overflow-auto max-h-60">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50">
              {dataSource.headers.map((h) => (
                <th key={h} className="px-2 py-1.5 text-left font-medium text-gray-600 border-b border-gray-200 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {previewRows.map((row, i) => (
              <tr key={i} className="border-b border-gray-100 last:border-0">
                {dataSource.headers.map((h) => (
                  <td key={h} className="px-2 py-1 text-gray-700 whitespace-nowrap max-w-[120px] truncate">
                    {row[h] ?? ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
