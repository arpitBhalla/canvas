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
    <div className="space-y-2">
      <div className="text-[11px] font-medium text-gray-600">Actions</div>
      <div className="grid grid-cols-2 gap-1.5">
        <ActionButton onClick={() => duplicateElement(element.id)} icon={<Copy size={13} />}>
          Duplicate
        </ActionButton>
        <ActionButton onClick={() => reorderElement(element.id, 'top')} icon={<ArrowUpToLine size={13} />}>
          Front
        </ActionButton>
        <ActionButton onClick={() => reorderElement(element.id, 'bottom')} icon={<ArrowDownToLine size={13} />}>
          Back
        </ActionButton>
        <ActionButton
          onClick={() => updateElement(element.id, { locked: !element.locked })}
          icon={element.locked ? <Lock size={13} /> : <Unlock size={13} />}
          active={element.locked}
        >
          {element.locked ? 'Locked' : 'Unlock'}
        </ActionButton>
      </div>
      <button
        onClick={() => deleteElement(element.id)}
        className="w-full h-8 flex items-center justify-center gap-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
      >
        <Trash2 size={13} /> Delete
      </button>
    </div>
  )
}

function ActionButton({
  onClick,
  icon,
  active,
  children,
}: {
  onClick: () => void
  icon: React.ReactNode
  active?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`h-8 flex items-center justify-center gap-1.5 text-xs font-medium border rounded-md transition-colors ${
        active
          ? 'bg-violet-50 border-violet-300 text-violet-700'
          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
      }`}
    >
      {icon}
      {children}
    </button>
  )
}
