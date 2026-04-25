import { useRef, useState } from 'react'
import { Upload, FileText, X, AlertTriangle } from 'lucide-react'
import { useEditorStore } from '../../store/editorStore'
import { parseCSV, parseJSON } from '../../utils/csv'
import { extractVariables } from '../../utils/variables'
import DataTable from './DataTable'

export default function DataSourcePanel() {
  const dataSource = useEditorStore((s) => s.dataSource)
  const setDataSource = useEditorStore((s) => s.setDataSource)
  const clearDataSource = useEditorStore((s) => s.clearDataSource)
  const elements = useEditorStore((s) => s.template.elements)

  const [jsonText, setJsonText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Find all variables used in the template
  const usedVars = new Set(
    elements
      .filter((e) => e.type === 'text')
      .flatMap((e) => extractVariables((e as { content: string }).content))
  )

  const missingVars = dataSource
    ? [...usedVars].filter((v) => !dataSource.headers.includes(v))
    : []

  async function handleCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    try {
      const ds = await parseCSV(file)
      setDataSource(ds)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  function handleJSON() {
    setError(null)
    try {
      const ds = parseJSON(jsonText)
      setDataSource(ds)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <div className="p-3 space-y-4">
      {!dataSource ? (
        <>
          <div>
            <label className="block text-xs text-gray-500 mb-2">Upload CSV</label>
            <input ref={fileRef} type="file" accept=".csv" onChange={handleCSV} className="hidden" />
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-6 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-violet-400 hover:text-violet-600 transition-colors"
            >
              <Upload size={20} />
              <span className="text-sm">Choose CSV file</span>
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-gray-400">or paste JSON</span>
            </div>
          </div>

          <div>
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder={'[\n  { "firstName": "John", "lastName": "Doe" },\n  { "firstName": "Jane", "lastName": "Smith" }\n]'}
              rows={6}
              className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm font-mono resize-none"
            />
            <button
              onClick={handleJSON}
              disabled={!jsonText.trim()}
              className="w-full mt-2 py-1.5 text-sm bg-violet-600 text-white rounded hover:bg-violet-700 disabled:opacity-40 transition-colors"
            >
              Parse JSON
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded">
            <FileText size={16} className="text-green-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-green-800 font-medium truncate">
                {dataSource.fileName ?? 'JSON data'}
              </p>
              <p className="text-xs text-green-600">
                {dataSource.records.length} records, {dataSource.headers.length} columns
              </p>
            </div>
            <button
              onClick={clearDataSource}
              className="p-1 text-green-600 hover:text-red-600 transition-colors"
              title="Remove data"
            >
              <X size={14} />
            </button>
          </div>

          {missingVars.length > 0 && (
            <div className="flex items-start gap-2 p-2 bg-amber-50 border border-amber-200 rounded">
              <AlertTriangle size={14} className="text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700">
                Missing columns for variables: {missingVars.map((v) => `{{${v}}}`).join(', ')}
              </p>
            </div>
          )}

          <DataTable />
        </>
      )}

      {error && (
        <p className="text-xs text-red-600 bg-red-50 p-2 rounded">{error}</p>
      )}
    </div>
  )
}
