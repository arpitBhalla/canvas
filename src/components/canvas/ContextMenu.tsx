import { useEffect, useRef } from 'react'
import {
  Copy,
  Trash2,
  ArrowUpToLine,
  ArrowDownToLine,
  ArrowUp,
  ArrowDown,
  Lock,
  Unlock,
  Eye,
  EyeOff,
} from 'lucide-react'
import { useEditorStore } from '../../store/editorStore'
import type { CanvasElement } from '../../types'

interface Props {
  x: number
  y: number
  element: CanvasElement | null
  onClose: () => void
}

export default function ContextMenu({ x, y, element, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const duplicate = useEditorStore((s) => s.duplicateSelected)
  const remove = useEditorStore((s) => s.deleteSelected)
  const reorder = useEditorStore((s) => s.reorderElement)
  const updateElement = useEditorStore((s) => s.updateElement)

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) onClose()
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  function run(action: () => void) {
    action()
    onClose()
  }

  if (!element) return null

  const visible = element.visible !== false

  return (
    <div
      ref={ref}
      className="fixed z-50 min-w-[180px] bg-white border border-gray-200 rounded-lg shadow-xl py-1"
      style={{ left: x, top: y }}
    >
      <Item icon={<Copy size={13} />} label="Duplicate" hint="⌘D" onClick={() => run(duplicate)} />
      <Item
        icon={visible ? <EyeOff size={13} /> : <Eye size={13} />}
        label={visible ? 'Hide' : 'Show'}
        onClick={() => run(() => updateElement(element.id, { visible: !visible }))}
      />
      <Item
        icon={element.locked ? <Unlock size={13} /> : <Lock size={13} />}
        label={element.locked ? 'Unlock' : 'Lock'}
        onClick={() => run(() => updateElement(element.id, { locked: !element.locked }))}
      />
      <Divider />
      <Item icon={<ArrowUpToLine size={13} />} label="Bring to front" onClick={() => run(() => reorder(element.id, 'top'))} />
      <Item icon={<ArrowUp size={13} />} label="Bring forward" onClick={() => run(() => reorder(element.id, 'up'))} />
      <Item icon={<ArrowDown size={13} />} label="Send backward" onClick={() => run(() => reorder(element.id, 'down'))} />
      <Item icon={<ArrowDownToLine size={13} />} label="Send to back" onClick={() => run(() => reorder(element.id, 'bottom'))} />
      <Divider />
      <Item
        icon={<Trash2 size={13} />}
        label="Delete"
        hint="⌫"
        danger
        onClick={() => run(remove)}
      />
    </div>
  )
}

function Item({
  icon,
  label,
  hint,
  onClick,
  danger,
}: {
  icon: React.ReactNode
  label: string
  hint?: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left ${
        danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-800 hover:bg-gray-50'
      }`}
    >
      <span className={danger ? 'text-red-500' : 'text-gray-400'}>{icon}</span>
      <span className="flex-1">{label}</span>
      {hint && <span className="text-[10px] text-gray-400">{hint}</span>}
    </button>
  )
}

function Divider() {
  return <div className="border-t border-gray-100 my-1" />
}
