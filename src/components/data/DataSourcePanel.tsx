import { useRef, useState } from 'react'
import { Upload, FileText, X, AlertTriangle, Globe, Code, Loader2, RefreshCw } from 'lucide-react'
import { useEditorStore } from '../../store/editorStore'
import { parseCSV, parseJSON } from '../../utils/csv'
import { fetchApiSource } from '../../utils/api'
import { extractVariables } from '../../utils/variables'
import DataTable from './DataTable'

type Mode = 'csv' | 'json' | 'api'

export default function DataSourcePanel() {
  const dataSource = useEditorStore((s) => s.dataSource)
  const setDataSource = useEditorStore((s) => s.setDataSource)
  const clearDataSource = useEditorStore((s) => s.clearDataSource)
  const elements = useEditorStore((s) => s.template.elements)

  const [mode, setMode] = useState<Mode>('csv')
  const [jsonText, setJsonText] = useState('')
  const [apiUrl, setApiUrl] = useState('')
  const [apiPath, setApiPath] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

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

  async function handleApi(refresh = false) {
    setError(null)
    setLoading(true)
    try {
      const url = refresh ? dataSource?.apiConfig?.url ?? apiUrl : apiUrl
      const path = refresh ? dataSource?.apiConfig?.path ?? '' : apiPath
      const ds = await fetchApiSource(url, path)
      setDataSource(ds)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  if (dataSource) {
    return (
      <div className="p-3 space-y-3">
        <div className="flex items-start gap-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg">
          <div className="w-7 h-7 rounded-md bg-emerald-100 flex items-center justify-center shrink-0">
            {dataSource.type === 'api' ? (
              <Globe size={14} className="text-emerald-700" />
            ) : (
              <FileText size={14} className="text-emerald-700" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-emerald-900 truncate">
              {dataSource.fileName ??
                (dataSource.type === 'json' ? 'JSON paste' : dataSource.type.toUpperCase())}
            </p>
            <p className="text-[11px] text-emerald-700">
              {dataSource.records.length} records · {dataSource.headers.length} columns
            </p>
          </div>
          {dataSource.type === 'api' && (
            <button
              onClick={() => handleApi(true)}
              disabled={loading}
              className="p-1 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100 rounded transition-colors"
              title="Refresh from API"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            </button>
          )}
          <button
            onClick={clearDataSource}
            className="p-1 text-emerald-700 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Remove data"
          >
            <X size={14} />
          </button>
        </div>

        {missingVars.length > 0 && (
          <div className="flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle size={13} className="text-amber-600 mt-0.5 shrink-0" />
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Missing columns: {missingVars.map((v) => `{{${v}}}`).join(', ')}
            </p>
          </div>
        )}

        <DataTable />

        {error && (
          <p className="text-[11px] text-red-700 bg-red-50 border border-red-200 p-2 rounded-lg">
            {error}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="p-3 space-y-3">
      <div className="flex p-0.5 bg-gray-100 rounded-lg">
        <SourceTab active={mode === 'csv'} onClick={() => setMode('csv')} icon={<Upload size={12} />} label="CSV" />
        <SourceTab active={mode === 'json'} onClick={() => setMode('json')} icon={<Code size={12} />} label="JSON" />
        <SourceTab active={mode === 'api'} onClick={() => setMode('api')} icon={<Globe size={12} />} label="API" />
      </div>

      {mode === 'csv' && (
        <div>
          <input ref={fileRef} type="file" accept=".csv" onChange={handleCSV} className="hidden" />
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full flex flex-col items-center justify-center gap-2 py-8 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-violet-400 hover:bg-violet-50/40 hover:text-violet-600 transition-all"
          >
            <Upload size={20} />
            <div className="text-center">
              <div className="text-sm font-medium">Choose a CSV file</div>
              <div className="text-[11px] text-gray-400 mt-0.5">First row should be headers</div>
            </div>
          </button>
        </div>
      )}

      {mode === 'json' && (
        <div className="space-y-2">
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder={'[\n  { "firstName": "John" },\n  { "firstName": "Jane" }\n]'}
            rows={7}
            className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-xs font-mono resize-none focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
          />
          <button
            onClick={handleJSON}
            disabled={!jsonText.trim()}
            className="w-full py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Parse JSON
          </button>
        </div>
      )}

      {mode === 'api' && (
        <div className="space-y-2">
          <div>
            <label className="block text-[11px] font-medium text-gray-600 mb-1">Endpoint URL</label>
            <input
              type="url"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="https://jsonplaceholder.typicode.com/users"
              className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-600 mb-1">
              Array path <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={apiPath}
              onChange={(e) => setApiPath(e.target.value)}
              placeholder="data.results"
              className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
            />
            <p className="text-[10px] text-gray-400 mt-1 leading-snug">
              Dot path to the array inside the response. Leave empty if the response is already an array.
            </p>
          </div>
          <button
            onClick={() => handleApi(false)}
            disabled={!apiUrl.trim() || loading}
            className="w-full flex items-center justify-center gap-1.5 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />}
            {loading ? 'Fetching…' : 'Fetch data'}
          </button>
        </div>
      )}

      {error && (
        <p className="text-[11px] text-red-700 bg-red-50 border border-red-200 p-2 rounded-lg">
          {error}
        </p>
      )}
    </div>
  )
}

function SourceTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-[11px] font-medium rounded-md transition-all ${
        active ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}
