import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useEditorStore } from '../../store/editorStore'
import MergedCanvas from './MergedCanvas'

export default function PreviewModal() {
  const dataSource = useEditorStore((s) => s.dataSource)
  const previewRecordIndex = useEditorStore((s) => s.previewRecordIndex)
  const setPreviewRecordIndex = useEditorStore((s) => s.setPreviewRecordIndex)
  const togglePreview = useEditorStore((s) => s.togglePreview)

  if (!dataSource || dataSource.records.length === 0) return null

  const total = dataSource.records.length
  const currentRecord = dataSource.records[previewRecordIndex]!

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl flex flex-col max-h-[90vh] max-w-[90vw]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 className="font-semibold text-gray-800">Mail Merge Preview</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPreviewRecordIndex(Math.max(0, previewRecordIndex - 1))}
              disabled={previewRecordIndex === 0}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm text-gray-600 min-w-[5rem] text-center">
              Record {previewRecordIndex + 1} of {total}
            </span>
            <button
              onClick={() => setPreviewRecordIndex(Math.min(total - 1, previewRecordIndex + 1))}
              disabled={previewRecordIndex === total - 1}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <button
            onClick={togglePreview}
            className="p-1.5 rounded hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto p-6 bg-gray-100 flex items-start justify-center">
          <MergedCanvas data={currentRecord} />
        </div>

        {/* Record data */}
        <div className="border-t border-gray-200 px-4 py-3 max-h-32 overflow-auto">
          <div className="flex flex-wrap gap-2">
            {Object.entries(currentRecord).map(([key, value]) => (
              <span key={key} className="inline-flex items-center gap-1 text-xs bg-gray-100 rounded px-2 py-1">
                <span className="font-medium text-gray-500">{key}:</span>
                <span className="text-gray-700">{value}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
