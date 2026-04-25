import {
  AlignStartHorizontal,
  AlignCenterHorizontal,
  AlignEndHorizontal,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  AlignHorizontalDistributeCenter,
  AlignVerticalDistributeCenter,
  Trash2,
  Copy,
  Lock,
} from 'lucide-react'
import { useEditorStore, type AlignAxis, type DistributeAxis } from '../../store/editorStore'

export default function AlignmentToolbar() {
  const selectedElementIds = useEditorStore((s) => s.selectedElementIds)
  const alignSelected = useEditorStore((s) => s.alignSelected)
  const distributeSelected = useEditorStore((s) => s.distributeSelected)
  const deleteSelected = useEditorStore((s) => s.deleteSelected)
  const duplicateSelected = useEditorStore((s) => s.duplicateSelected)
  const elements = useEditorStore((s) => s.template.elements)
  const updateElement = useEditorStore((s) => s.updateElement)

  const canDistribute = selectedElementIds.length >= 3

  function lockAll() {
    for (const id of selectedElementIds) updateElement(id, { locked: true })
  }
  function hideAll() {
    for (const id of selectedElementIds) {
      const el = elements.find((e) => e.id === id)
      if (el) updateElement(id, { visible: el.visible === false ? true : false })
    }
  }

  const allHidden =
    selectedElementIds.length > 0 &&
    selectedElementIds.every((id) => elements.find((e) => e.id === id)?.visible === false)

  return (
    <div className="space-y-4">
      <div>
        <div className="text-[11px] font-medium text-gray-600 mb-2">Align</div>
        <div className="grid grid-cols-3 gap-1">
          <AlignBtn axis="left" onClick={alignSelected} title="Align left">
            <AlignStartVertical size={14} />
          </AlignBtn>
          <AlignBtn axis="center-h" onClick={alignSelected} title="Center horizontally">
            <AlignCenterVertical size={14} />
          </AlignBtn>
          <AlignBtn axis="right" onClick={alignSelected} title="Align right">
            <AlignEndVertical size={14} />
          </AlignBtn>
          <AlignBtn axis="top" onClick={alignSelected} title="Align top">
            <AlignStartHorizontal size={14} />
          </AlignBtn>
          <AlignBtn axis="center-v" onClick={alignSelected} title="Center vertically">
            <AlignCenterHorizontal size={14} />
          </AlignBtn>
          <AlignBtn axis="bottom" onClick={alignSelected} title="Align bottom">
            <AlignEndHorizontal size={14} />
          </AlignBtn>
        </div>
      </div>

      <div>
        <div className="text-[11px] font-medium text-gray-600 mb-2">Distribute</div>
        <div className="grid grid-cols-2 gap-1">
          <DistBtn axis="horizontal" disabled={!canDistribute} onClick={distributeSelected} title="Distribute horizontally">
            <AlignHorizontalDistributeCenter size={14} />
            <span>Horizontal</span>
          </DistBtn>
          <DistBtn axis="vertical" disabled={!canDistribute} onClick={distributeSelected} title="Distribute vertically">
            <AlignVerticalDistributeCenter size={14} />
            <span>Vertical</span>
          </DistBtn>
        </div>
        {!canDistribute && (
          <div className="text-[10px] text-gray-400 mt-1">Select 3+ to distribute.</div>
        )}
      </div>

      <div className="pt-3 border-t border-gray-100 space-y-1.5">
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={duplicateSelected}
            className="h-8 flex items-center justify-center gap-1.5 text-xs font-medium border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Copy size={13} /> Duplicate
          </button>
          <button
            onClick={lockAll}
            className="h-8 flex items-center justify-center gap-1.5 text-xs font-medium border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Lock size={13} /> Lock all
          </button>
        </div>
        <button
          onClick={hideAll}
          className="w-full h-8 flex items-center justify-center gap-1.5 text-xs font-medium border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
        >
          {allHidden ? 'Show all' : 'Hide all'}
        </button>
        <button
          onClick={deleteSelected}
          className="w-full h-8 flex items-center justify-center gap-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
        >
          <Trash2 size={13} /> Delete {selectedElementIds.length}
        </button>
      </div>
    </div>
  )
}

function AlignBtn({
  axis,
  onClick,
  title,
  children,
}: {
  axis: AlignAxis
  onClick: (a: AlignAxis) => void
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={() => onClick(axis)}
      title={title}
      className="h-9 flex items-center justify-center text-gray-700 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
    >
      {children}
    </button>
  )
}

function DistBtn({
  axis,
  onClick,
  title,
  disabled,
  children,
}: {
  axis: DistributeAxis
  onClick: (a: DistributeAxis) => void
  title: string
  disabled: boolean
  children: React.ReactNode
}) {
  return (
    <button
      onClick={() => onClick(axis)}
      title={title}
      disabled={disabled}
      className="h-9 flex items-center justify-center gap-1 text-xs font-medium text-gray-700 border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
    >
      {children}
    </button>
  )
}
