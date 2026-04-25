import { Eye, EyeOff } from 'lucide-react'
import { useEditorStore } from '../../store/editorStore'
import type { CanvasElement } from '../../types'
import { Field } from './primitives'

interface Props {
  element: CanvasElement
}

export default function VisibilityField({ element }: Props) {
  const updateElement = useEditorStore((s) => s.updateElement)
  const dataSource = useEditorStore((s) => s.dataSource)
  const visible = element.visible !== false

  return (
    <div className="pt-3 border-t border-gray-100 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-gray-600">Visible</span>
        <button
          onClick={() => updateElement(element.id, { visible: !visible })}
          className={`flex items-center gap-1 h-7 px-2 text-xs font-medium border rounded-md transition-colors ${
            visible
              ? 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              : 'bg-gray-100 border-gray-200 text-gray-500'
          }`}
        >
          {visible ? <Eye size={12} /> : <EyeOff size={12} />}
          {visible ? 'Shown' : 'Hidden'}
        </button>
      </div>

      <Field label="Hide when column is empty">
        <select
          value={element.hideWhenEmpty ?? ''}
          onChange={(e) => updateElement(element.id, { hideWhenEmpty: e.target.value || undefined })}
          className="w-full h-8 border border-gray-200 rounded-md px-2 text-xs bg-white focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
        >
          <option value="">— never hide —</option>
          {(dataSource?.headers ?? []).map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
        {!dataSource && (
          <p className="text-[10px] text-gray-400 mt-1">Connect data first to enable.</p>
        )}
      </Field>
    </div>
  )
}
