import { useState } from 'react'
import { Eye, EyeOff, Lock, Unlock, Type, Square, Circle, Triangle, Star, Minus, MoveRight, PenTool, Image as ImageIcon, GripVertical } from 'lucide-react'
import { useEditorStore } from '../../store/editorStore'
import type { CanvasElement, ShapeElement } from '../../types'

function defaultName(el: CanvasElement): string {
  if (el.name) return el.name
  if (el.type === 'text') {
    const content = (el as unknown as { content: string }).content || ''
    const trimmed = content.replace(/\s+/g, ' ').trim()
    return trimmed.length > 0 ? trimmed.slice(0, 30) : 'Text'
  }
  if (el.type === 'shape') {
    const s = el as ShapeElement
    return s.shape.charAt(0).toUpperCase() + s.shape.slice(1)
  }
  if (el.type === 'path') return 'Path'
  return 'Image'
}

function iconFor(el: CanvasElement) {
  if (el.type === 'text') return Type
  if (el.type === 'image') return ImageIcon
  if (el.type === 'path') return PenTool
  const s = el as ShapeElement
  if (s.shape === 'circle') return Circle
  if (s.shape === 'triangle') return Triangle
  if (s.shape === 'star') return Star
  if (s.shape === 'line') return Minus
  if (s.shape === 'arrow') return MoveRight
  return Square
}

export default function LayersPanel() {
  const elements = useEditorStore((s) => s.template.elements)
  const selectedIds = useEditorStore((s) => s.selectedElementIds)
  const selectElement = useEditorStore((s) => s.selectElement)
  const toggleSelectElement = useEditorStore((s) => s.toggleSelectElement)
  const updateElement = useEditorStore((s) => s.updateElement)
  const setElementZOrder = useEditorStore((s) => s.setElementZOrder)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [draftName, setDraftName] = useState('')
  const [dragId, setDragId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  const sorted = [...elements].sort((a, b) => b.zIndex - a.zIndex)

  function commitRename(id: string) {
    const el = elements.find((e) => e.id === id)
    if (!el) return
    const trimmed = draftName.trim()
    updateElement(id, { name: trimmed || undefined })
    setRenamingId(null)
  }

  function handleDrop(targetId: string) {
    if (!dragId || dragId === targetId) {
      setDragId(null)
      setDragOverId(null)
      return
    }
    const ids = sorted.map((e) => e.id)
    const fromIdx = ids.indexOf(dragId)
    const toIdx = ids.indexOf(targetId)
    if (fromIdx < 0 || toIdx < 0) return
    const next = [...ids]
    next.splice(fromIdx, 1)
    next.splice(toIdx, 0, dragId)
    setElementZOrder([...next].reverse())
    setDragId(null)
    setDragOverId(null)
  }

  if (elements.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-xs text-gray-500">No layers yet. Add elements from the toolbar.</p>
      </div>
    )
  }

  return (
    <div className="py-1">
      {sorted.map((el) => {
        const Icon = iconFor(el)
        const isSelected = selectedIds.includes(el.id)
        const isVisible = el.visible !== false
        const isRenaming = renamingId === el.id

        return (
          <div
            key={el.id}
            draggable={!isRenaming}
            onDragStart={() => setDragId(el.id)}
            onDragOver={(e) => {
              e.preventDefault()
              if (dragId && dragId !== el.id) setDragOverId(el.id)
            }}
            onDragLeave={() => {
              if (dragOverId === el.id) setDragOverId(null)
            }}
            onDrop={(e) => {
              e.preventDefault()
              handleDrop(el.id)
            }}
            onDragEnd={() => {
              setDragId(null)
              setDragOverId(null)
            }}
            onClick={(e) => {
              if (e.shiftKey) toggleSelectElement(el.id)
              else selectElement(el.id)
            }}
            onDoubleClick={() => {
              setRenamingId(el.id)
              setDraftName(defaultName(el))
            }}
            className={`group flex items-center gap-1.5 px-2 py-1.5 mx-2 rounded-md cursor-pointer transition-colors ${
              isSelected
                ? 'bg-violet-50 ring-1 ring-violet-300'
                : 'hover:bg-gray-50'
            } ${dragOverId === el.id ? 'ring-2 ring-pink-400' : ''} ${
              dragId === el.id ? 'opacity-50' : ''
            }`}
          >
            <GripVertical size={12} className="text-gray-300 group-hover:text-gray-400 shrink-0" />
            <Icon size={13} className="text-gray-500 shrink-0" />
            {isRenaming ? (
              <input
                autoFocus
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onBlur={() => commitRename(el.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitRename(el.id)
                  if (e.key === 'Escape') setRenamingId(null)
                }}
                className="flex-1 min-w-0 text-xs border border-violet-400 rounded px-1 py-0.5 focus:outline-none"
              />
            ) : (
              <span
                className={`flex-1 min-w-0 truncate text-xs ${
                  isVisible ? 'text-gray-800' : 'text-gray-400 italic'
                }`}
              >
                {defaultName(el)}
              </span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation()
                updateElement(el.id, { visible: !isVisible })
              }}
              className="p-0.5 text-gray-400 hover:text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
              title={isVisible ? 'Hide' : 'Show'}
            >
              {isVisible ? <Eye size={12} /> : <EyeOff size={12} />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                updateElement(el.id, { locked: !el.locked })
              }}
              className={`p-0.5 hover:text-gray-700 transition-opacity ${
                el.locked ? 'text-gray-700 opacity-100' : 'text-gray-400 opacity-0 group-hover:opacity-100'
              }`}
              title={el.locked ? 'Unlock' : 'Lock'}
            >
              {el.locked ? <Lock size={12} /> : <Unlock size={12} />}
            </button>
          </div>
        )
      })}
    </div>
  )
}
