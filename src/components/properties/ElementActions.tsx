import { Copy, Trash2, ArrowUpToLine, ArrowDownToLine, Lock, Unlock } from 'lucide-react'
import { useEditorStore } from '../../store/editorStore'
import type { CanvasElement } from '../../types'

interface Props {
  element: CanvasElement
}

export default function ElementActions({ element }: Props) {
  const deleteElement = useEditorStore((s) => s.deleteElement)
  const duplicateElement = useEditorStore((s) => s.duplicateElement)
  const updateElement = useEditorStore((s) => s.updateElement)
  const reorderElement = useEditorStore((s) => s.reorderElement)

  return (
    <div className="border-t border-gray-200 pt-4 space-y-2">
      <label className="block text-xs text-gray-500 mb-2">Actions</label>
      <div className="grid grid-cols-2 gap-1">
        <button
          onClick={() => duplicateElement(element.id)}
          className="flex items-center gap-1.5 py-1.5 px-2 text-sm border border-gray-200 rounded hover:bg-gray-50 transition-colors"
        >
          <Copy size={14} /> Duplicate
        </button>
        <button
          onClick={() => deleteElement(element.id)}
          className="flex items-center gap-1.5 py-1.5 px-2 text-sm border border-red-200 text-red-600 rounded hover:bg-red-50 transition-colors"
        >
          <Trash2 size={14} /> Delete
        </button>
        <button
          onClick={() => reorderElement(element.id, 'top')}
          className="flex items-center gap-1.5 py-1.5 px-2 text-sm border border-gray-200 rounded hover:bg-gray-50 transition-colors"
        >
          <ArrowUpToLine size={14} /> Front
        </button>
        <button
          onClick={() => reorderElement(element.id, 'bottom')}
          className="flex items-center gap-1.5 py-1.5 px-2 text-sm border border-gray-200 rounded hover:bg-gray-50 transition-colors"
        >
          <ArrowDownToLine size={14} /> Back
        </button>
      </div>
      <button
        onClick={() => updateElement(element.id, { locked: !element.locked })}
        className="flex items-center gap-1.5 w-full py-1.5 px-2 text-sm border border-gray-200 rounded hover:bg-gray-50 transition-colors"
      >
        {element.locked ? <><Lock size={14} /> Locked</> : <><Unlock size={14} /> Unlocked</>}
      </button>
    </div>
  )
}
