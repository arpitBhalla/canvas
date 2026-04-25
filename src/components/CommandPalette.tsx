import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Type,
  Square,
  Circle,
  Triangle,
  Star,
  Image as ImageIcon,
  Pencil,
  Spline,
  Minus,
  Eye,
  Trash2,
  Copy,
  ZoomIn,
  ZoomOut,
  Undo2,
  Redo2,
  FileText,
  Search,
} from 'lucide-react'
import { useEditorStore } from '../store/editorStore'
import { useNavigate } from 'react-router-dom'
import type { ShapeElement } from '../types'

interface Command {
  id: string
  label: string
  hint?: string
  group: string
  icon: React.ReactNode
  run: () => void
}

interface Props {
  open: boolean
  onClose: () => void
}

export default function CommandPalette({ open, onClose }: Props) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [activeIdx, setActiveIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const elements = useEditorStore((s) => s.template.elements)
  const dataSource = useEditorStore((s) => s.dataSource)

  const commands = useMemo<Command[]>(() => {
    const editor = useEditorStore.getState()
    const list: Command[] = [
      {
        id: 'add-text',
        group: 'Add',
        label: 'Add text',
        icon: <Type size={14} />,
        run: () => editor.addElement('text'),
      },
      {
        id: 'add-rectangle',
        group: 'Add',
        label: 'Add rectangle',
        icon: <Square size={14} />,
        run: () => editor.addElement('shape', { shape: 'rectangle' } as Partial<ShapeElement>),
      },
      {
        id: 'add-circle',
        group: 'Add',
        label: 'Add circle',
        icon: <Circle size={14} />,
        run: () => editor.addElement('shape', { shape: 'circle', borderRadius: 0 } as Partial<ShapeElement>),
      },
      {
        id: 'add-triangle',
        group: 'Add',
        label: 'Add triangle',
        icon: <Triangle size={14} />,
        run: () => editor.addElement('shape', { shape: 'triangle' } as Partial<ShapeElement>),
      },
      {
        id: 'add-star',
        group: 'Add',
        label: 'Add star',
        icon: <Star size={14} />,
        run: () => editor.addElement('shape', { shape: 'star' } as Partial<ShapeElement>),
      },
      {
        id: 'add-image',
        group: 'Add',
        label: 'Add image (placeholder)',
        icon: <ImageIcon size={14} />,
        run: () => editor.addElement('image'),
      },
      {
        id: 'draw-straight',
        group: 'Draw',
        label: 'Draw straight line',
        icon: <Minus size={14} />,
        run: () => editor.setDrawingMode('straight'),
      },
      {
        id: 'draw-curve',
        group: 'Draw',
        label: 'Draw curve',
        icon: <Spline size={14} />,
        run: () => editor.setDrawingMode('curve'),
      },
      {
        id: 'draw-freehand',
        group: 'Draw',
        label: 'Freehand sketch',
        icon: <Pencil size={14} />,
        run: () => editor.setDrawingMode('freehand'),
      },
      {
        id: 'undo',
        group: 'History',
        label: 'Undo',
        hint: '⌘Z',
        icon: <Undo2 size={14} />,
        run: () => useEditorStore.temporal.getState().undo(),
      },
      {
        id: 'redo',
        group: 'History',
        label: 'Redo',
        hint: '⌘⇧Z',
        icon: <Redo2 size={14} />,
        run: () => useEditorStore.temporal.getState().redo(),
      },
      {
        id: 'zoom-in',
        group: 'View',
        label: 'Zoom in',
        icon: <ZoomIn size={14} />,
        run: () => editor.setZoom(editor.zoom + 0.1),
      },
      {
        id: 'zoom-out',
        group: 'View',
        label: 'Zoom out',
        icon: <ZoomOut size={14} />,
        run: () => editor.setZoom(editor.zoom - 0.1),
      },
      {
        id: 'zoom-reset',
        group: 'View',
        label: 'Reset zoom to 100%',
        icon: <ZoomIn size={14} />,
        run: () => editor.setZoom(1),
      },
      {
        id: 'preview',
        group: 'Export',
        label: 'Toggle merge preview',
        icon: <Eye size={14} />,
        run: () => {
          if (dataSource) editor.togglePreview()
        },
      },
      {
        id: 'home',
        group: 'Navigate',
        label: 'Go to projects',
        icon: <FileText size={14} />,
        run: () => navigate('/'),
      },
      {
        id: 'select-all',
        group: 'Selection',
        label: 'Select all',
        hint: '⌘A',
        icon: <Copy size={14} />,
        run: () => editor.selectMany(elements.map((e) => e.id)),
      },
      {
        id: 'delete-selected',
        group: 'Selection',
        label: 'Delete selected',
        icon: <Trash2 size={14} />,
        run: () => editor.deleteSelected(),
      },
    ]

    for (const el of elements) {
      const name =
        el.name ||
        (el.type === 'text'
          ? (el as unknown as { content: string }).content?.slice(0, 30) || 'Text'
          : el.type === 'shape'
          ? (el as ShapeElement).shape
          : el.type)
      list.push({
        id: `select-${el.id}`,
        group: 'Layers',
        label: `Select: ${name}`,
        icon:
          el.type === 'text'
            ? <Type size={14} />
            : el.type === 'image'
            ? <ImageIcon size={14} />
            : el.type === 'path'
            ? <Pencil size={14} />
            : <Square size={14} />,
        run: () => editor.selectElement(el.id),
      })
    }

    return list
  }, [elements, dataSource, navigate])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return commands
    return commands.filter((c) =>
      `${c.group} ${c.label}`.toLowerCase().includes(q)
    )
  }, [query, commands])

  useEffect(() => {
    setActiveIdx(0)
  }, [query])

  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIdx(0)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${activeIdx}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIdx, open])

  if (!open) return null

  function runActive() {
    const cmd = filtered[activeIdx]
    if (!cmd) return
    cmd.run()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-start justify-center z-50 pt-[15vh] p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
          <Search size={16} className="text-gray-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setActiveIdx((i) => Math.min(filtered.length - 1, i + 1))
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setActiveIdx((i) => Math.max(0, i - 1))
              } else if (e.key === 'Enter') {
                e.preventDefault()
                runActive()
              } else if (e.key === 'Escape') {
                onClose()
              }
            }}
            placeholder="Type a command or search…"
            className="flex-1 text-sm focus:outline-none"
          />
          <kbd className="text-[10px] text-gray-400 border border-gray-200 rounded px-1.5 py-0.5">esc</kbd>
        </div>
        <div ref={listRef} className="max-h-80 overflow-y-auto py-1 scroll-thin">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-gray-400">No matches.</div>
          ) : (
            filtered.map((cmd, i) => (
              <button
                key={cmd.id}
                data-idx={i}
                onMouseEnter={() => setActiveIdx(i)}
                onClick={() => {
                  cmd.run()
                  onClose()
                }}
                className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-left transition-colors ${
                  i === activeIdx ? 'bg-violet-50 text-violet-700' : 'hover:bg-gray-50 text-gray-800'
                }`}
              >
                <span className={i === activeIdx ? 'text-violet-600' : 'text-gray-400'}>{cmd.icon}</span>
                <span className="flex-1 truncate">{cmd.label}</span>
                <span className="text-[10px] text-gray-400">{cmd.group}</span>
                {cmd.hint && (
                  <kbd className="text-[10px] text-gray-400 border border-gray-200 rounded px-1.5 py-0.5">
                    {cmd.hint}
                  </kbd>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
