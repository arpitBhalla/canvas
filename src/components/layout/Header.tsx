import { useRef, useState } from 'react'
import {
  Type,
  Square,
  Image,
  Eye,
  ZoomIn,
  ZoomOut,
  Undo2,
  Redo2,
  Circle,
  Download,
  FileText,
  Loader2,
  ArrowLeft,
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useEditorStore } from '../../store/editorStore'
import { useProjectsStore } from '../../store/projectsStore'
import { generatePDF } from '../../utils/pdf'
import type { ShapeElement } from '../../types'

const MAX_IMAGE_PIXELS = 1600

function readFileAsImage(file: File): Promise<{ src: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error)
    reader.onload = () => {
      const src = String(reader.result ?? '')
      const img = new window.Image()
      img.onerror = () => reject(new Error('decode failed'))
      img.onload = () => resolve({ src, width: img.naturalWidth, height: img.naturalHeight })
      img.src = src
    }
    reader.readAsDataURL(file)
  })
}

export default function Header() {
  const navigate = useNavigate()
  const { id: projectId } = useParams<{ id: string }>()
  const addElement = useEditorStore((s) => s.addElement)
  const togglePreview = useEditorStore((s) => s.togglePreview)
  const dataSource = useEditorStore((s) => s.dataSource)
  const zoom = useEditorStore((s) => s.zoom)
  const setZoom = useEditorStore((s) => s.setZoom)
  const templateName = useEditorStore((s) => s.template.name)
  const renameProject = useProjectsStore((s) => s.renameProject)
  const [exportingPdf, setExportingPdf] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleExportPDF() {
    const { template } = useEditorStore.getState()
    const ds = useEditorStore.getState().dataSource
    if (!ds) return
    setExportingPdf(true)
    try {
      await generatePDF(template, ds.records)
    } finally {
      setExportingPdf(false)
    }
  }

  async function handleImageFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    const { template } = useEditorStore.getState()
    let offset = 0
    for (const file of Array.from(files).filter((f) => f.type.startsWith('image/'))) {
      try {
        const img = await readFileAsImage(file)
        const ratio = Math.min(
          1,
          MAX_IMAGE_PIXELS / Math.max(img.width, img.height),
          template.canvasWidth / img.width,
          template.canvasHeight / img.height
        )
        const width = Math.round(img.width * ratio)
        const height = Math.round(img.height * ratio)
        const x = Math.max(0, Math.min(template.canvasWidth - width, (template.canvasWidth - width) / 2 + offset))
        const y = Math.max(0, Math.min(template.canvasHeight - height, (template.canvasHeight - height) / 2 + offset))
        addElement('image', { src: img.src, size: { width, height }, position: { x, y } })
        offset += 20
      } catch {
        // skip
      }
    }
  }

  function setTemplateName(name: string) {
    useEditorStore.setState((s) => ({ template: { ...s.template, name } }))
  }

  function commitName() {
    const trimmed = templateName.trim() || 'Untitled Project'
    if (trimmed !== templateName) setTemplateName(trimmed)
    if (projectId) renameProject(projectId, trimmed)
  }

  return (
    <header className="h-12 bg-white border-b border-gray-200 flex items-center px-3 gap-1 shrink-0">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-1 px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
        title="Back to projects"
      >
        <ArrowLeft size={16} />
        <span className="hidden sm:inline">Projects</span>
      </button>

      <input
        value={templateName}
        onChange={(e) => setTemplateName(e.target.value)}
        onBlur={commitName}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
        }}
        className="ml-2 max-w-[200px] text-sm font-medium text-gray-900 bg-transparent border border-transparent hover:border-gray-200 focus:border-violet-400 focus:outline-none rounded px-2 py-1"
      />

      <div className="h-6 w-px bg-gray-200 mx-2" />

      <button
        onClick={() => addElement('text')}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
        title="Add Text"
      >
        <Type size={16} />
        <span className="hidden sm:inline">Text</span>
      </button>
      <button
        onClick={() => addElement('shape', { shape: 'rectangle' } as Partial<ShapeElement>)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
        title="Add Rectangle"
      >
        <Square size={16} />
        <span className="hidden sm:inline">Rect</span>
      </button>
      <button
        onClick={() => addElement('shape', { shape: 'circle', borderRadius: 0 } as Partial<ShapeElement>)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
        title="Add Circle"
      >
        <Circle size={16} />
        <span className="hidden sm:inline">Circle</span>
      </button>
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
        title="Upload image"
      >
        <Image size={16} />
        <span className="hidden sm:inline">Image</span>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          handleImageFiles(e.target.files)
          e.target.value = ''
        }}
      />

      <div className="h-6 w-px bg-gray-200 mx-1" />

      <button
        onClick={() => useEditorStore.temporal.getState().undo()}
        className="p-1.5 text-gray-500 hover:bg-gray-100 rounded transition-colors"
        title="Undo (Cmd+Z)"
      >
        <Undo2 size={16} />
      </button>
      <button
        onClick={() => useEditorStore.temporal.getState().redo()}
        className="p-1.5 text-gray-500 hover:bg-gray-100 rounded transition-colors"
        title="Redo (Cmd+Shift+Z)"
      >
        <Redo2 size={16} />
      </button>

      <div className="h-6 w-px bg-gray-200 mx-1" />

      <button
        onClick={() => setZoom(zoom - 0.1)}
        className="p-1.5 text-gray-500 hover:bg-gray-100 rounded transition-colors"
        title="Zoom Out"
      >
        <ZoomOut size={16} />
      </button>
      <span className="text-xs text-gray-500 min-w-[3rem] text-center">
        {Math.round(zoom * 100)}%
      </span>
      <button
        onClick={() => setZoom(zoom + 0.1)}
        className="p-1.5 text-gray-500 hover:bg-gray-100 rounded transition-colors"
        title="Zoom In"
      >
        <ZoomIn size={16} />
      </button>

      <div className="flex-1" />

      <button
        onClick={() => {
          const { template } = useEditorStore.getState()
          const json = JSON.stringify(template, null, 2)
          const blob = new Blob([json], { type: 'application/json' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `${template.name.replace(/\s+/g, '-').toLowerCase()}.json`
          a.click()
          URL.revokeObjectURL(url)
        }}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
        title="Export Template as JSON"
      >
        <Download size={16} />
        <span className="hidden sm:inline">Export</span>
      </button>

      <div className="h-6 w-px bg-gray-200 mx-1" />

      <button
        onClick={togglePreview}
        disabled={!dataSource}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-violet-600 text-white rounded hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        title={dataSource ? 'Preview Merge' : 'Upload data first to preview'}
      >
        <Eye size={16} />
        Preview
      </button>
      <button
        onClick={handleExportPDF}
        disabled={!dataSource || exportingPdf}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        title={dataSource ? 'Export all records as PDF' : 'Upload data first to export PDF'}
      >
        {exportingPdf ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
        {exportingPdf ? 'Exporting...' : 'PDF'}
      </button>
    </header>
  )
}
