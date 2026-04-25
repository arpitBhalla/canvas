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
  Images,
  Pencil,
  Spline,
  Minus,
  QrCode,
} from 'lucide-react'
import type { PathMode } from '../../types'
import { useNavigate, useParams } from 'react-router-dom'
import { useEditorStore } from '../../store/editorStore'
import { useProjectsStore } from '../../store/projectsStore'
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

function ToolButton({
  onClick,
  title,
  children,
}: {
  onClick: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="flex items-center gap-1.5 h-8 px-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
    >
      {children}
    </button>
  )
}

function PenButton({
  mode,
  current,
  setMode,
  title,
  children,
}: {
  mode: PathMode
  current: PathMode | null
  setMode: (mode: PathMode | null) => void
  title: string
  children: React.ReactNode
}) {
  const active = current === mode
  return (
    <button
      onClick={() => setMode(active ? null : mode)}
      title={title}
      className={`flex items-center justify-center h-8 w-8 rounded-md transition-colors ${
        active ? 'bg-violet-600 text-white' : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  )
}

function IconButton({
  onClick,
  title,
  children,
}: {
  onClick: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="flex items-center justify-center h-8 w-8 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors"
    >
      {children}
    </button>
  )
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
  const drawingMode = useEditorStore((s) => s.drawingMode)
  const setDrawingMode = useEditorStore((s) => s.setDrawingMode)
  const renameProject = useProjectsStore((s) => s.renameProject)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [exportingZip, setExportingZip] = useState<{ current: number; total: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleExportPDF() {
    const { template } = useEditorStore.getState()
    const ds = useEditorStore.getState().dataSource
    if (!ds) return
    setExportingPdf(true)
    try {
      const { generatePDF } = await import('../../utils/pdf')
      await generatePDF(template, ds.records)
    } finally {
      setExportingPdf(false)
    }
  }

  async function handleExportZip() {
    const { template } = useEditorStore.getState()
    const ds = useEditorStore.getState().dataSource
    if (!ds) return
    setExportingZip({ current: 0, total: ds.records.length })
    try {
      const { exportRecordsAsZip } = await import('../../utils/imageExport')
      await exportRecordsAsZip(template, ds.records, {
        onProgress: (current, total) => setExportingZip({ current, total }),
      })
    } finally {
      setExportingZip(null)
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
        addElement('image', {
          src: img.src,
          size: { width, height },
          position: { x, y },
          naturalWidth: img.width,
          naturalHeight: img.height,
        })
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
    <header className="h-14 bg-white border-b border-gray-200 flex items-center px-3 gap-2 shrink-0">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-1.5 h-8 px-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
        title="Back to projects"
      >
        <ArrowLeft size={16} />
        <span className="hidden sm:inline">Projects</span>
      </button>

      <div className="h-6 w-px bg-gray-200" />

      <input
        value={templateName}
        onChange={(e) => setTemplateName(e.target.value)}
        onBlur={commitName}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
        }}
        className="max-w-[220px] h-8 text-sm font-semibold text-gray-900 bg-transparent border border-transparent hover:border-gray-200 focus:border-violet-400 focus:bg-white focus:outline-none rounded-md px-2 transition-colors"
      />

      <div className="h-6 w-px bg-gray-200 mx-1" />

      <div className="flex items-center gap-0.5 p-0.5 bg-gray-50 rounded-lg border border-gray-200/70">
        <ToolButton onClick={() => addElement('text')} title="Add text">
          <Type size={16} />
          <span className="hidden md:inline">Text</span>
        </ToolButton>
        <ToolButton
          onClick={() => addElement('shape', { shape: 'rectangle' } as Partial<ShapeElement>)}
          title="Add rectangle"
        >
          <Square size={16} />
          <span className="hidden md:inline">Rect</span>
        </ToolButton>
        <ToolButton
          onClick={() => addElement('shape', { shape: 'circle', borderRadius: 0 } as Partial<ShapeElement>)}
          title="Add circle"
        >
          <Circle size={16} />
          <span className="hidden md:inline">Circle</span>
        </ToolButton>
        <ToolButton onClick={() => fileInputRef.current?.click()} title="Upload image">
          <Image size={16} />
          <span className="hidden md:inline">Image</span>
        </ToolButton>
        <ToolButton onClick={() => addElement('qr')} title="Add QR code">
          <QrCode size={16} />
          <span className="hidden md:inline">QR</span>
        </ToolButton>
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
      </div>

      <div className="flex items-center gap-0.5 p-0.5 bg-gray-50 rounded-lg border border-gray-200/70">
        <PenButton mode="straight" current={drawingMode} setMode={setDrawingMode} title="Straight line">
          <Minus size={16} />
        </PenButton>
        <PenButton mode="curve" current={drawingMode} setMode={setDrawingMode} title="Curve">
          <Spline size={16} />
        </PenButton>
        <PenButton mode="freehand" current={drawingMode} setMode={setDrawingMode} title="Freehand">
          <Pencil size={16} />
        </PenButton>
      </div>

      <div className="flex items-center gap-0.5">
        <IconButton onClick={() => useEditorStore.temporal.getState().undo()} title="Undo (Cmd+Z)">
          <Undo2 size={16} />
        </IconButton>
        <IconButton onClick={() => useEditorStore.temporal.getState().redo()} title="Redo (Cmd+Shift+Z)">
          <Redo2 size={16} />
        </IconButton>
      </div>

      <div className="flex items-center bg-gray-50 border border-gray-200/70 rounded-lg overflow-hidden">
        <IconButton onClick={() => setZoom(zoom - 0.1)} title="Zoom out">
          <ZoomOut size={16} />
        </IconButton>
        <span className="text-xs font-medium text-gray-600 min-w-[3rem] text-center px-1 tabular-nums">
          {Math.round(zoom * 100)}%
        </span>
        <IconButton onClick={() => setZoom(zoom + 0.1)} title="Zoom in">
          <ZoomIn size={16} />
        </IconButton>
      </div>

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
        className="flex items-center gap-1.5 h-8 px-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
        title="Export template as JSON"
      >
        <Download size={16} />
        <span className="hidden sm:inline">Export</span>
      </button>

      <div className="h-6 w-px bg-gray-200 mx-1" />

      <button
        onClick={togglePreview}
        disabled={!dataSource}
        className="flex items-center gap-1.5 h-8 px-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        title={dataSource ? 'Preview merge' : 'Upload data first to preview'}
      >
        <Eye size={16} />
        Preview
      </button>
      <button
        onClick={handleExportZip}
        disabled={!dataSource || exportingZip !== null}
        className="flex items-center gap-1.5 h-8 px-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        title={dataSource ? 'Export every record as PNG (ZIP)' : 'Upload data first'}
      >
        {exportingZip ? <Loader2 size={16} className="animate-spin" /> : <Images size={16} />}
        {exportingZip ? `${exportingZip.current}/${exportingZip.total}` : 'PNG zip'}
      </button>
      <button
        onClick={handleExportPDF}
        disabled={!dataSource || exportingPdf}
        className="flex items-center gap-1.5 h-8 px-3 text-sm font-medium bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
        title={dataSource ? 'Export all records as PDF' : 'Upload data first to export PDF'}
      >
        {exportingPdf ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
        {exportingPdf ? 'Exporting…' : 'PDF'}
      </button>
    </header>
  )
}
