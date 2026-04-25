import { useEditorStore } from '../../store/editorStore'

const PRESETS = [
  { label: 'A4 Portrait', w: 794, h: 1123 },
  { label: 'A4 Landscape', w: 1123, h: 794 },
  { label: 'Letter', w: 816, h: 1056 },
  { label: 'HD (1920x1080)', w: 1920, h: 1080 },
  { label: '1200x900', w: 1200, h: 900 },
  { label: '800x600', w: 800, h: 600 },
]

export default function CanvasProperties() {
  const template = useEditorStore((s) => s.template)

  function setSize(width: number, height: number) {
    useEditorStore.setState((s) => ({
      template: { ...s.template, canvasWidth: width, canvasHeight: height },
    }))
  }

  function setBg(backgroundColor: string) {
    useEditorStore.setState((s) => ({
      template: { ...s.template, backgroundColor },
    }))
  }

  function setName(name: string) {
    useEditorStore.setState((s) => ({
      template: { ...s.template, name },
    }))
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-gray-500 mb-1">Template Name</label>
        <input
          type="text"
          value={template.name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Width (px)</label>
          <input
            type="number"
            value={template.canvasWidth}
            onChange={(e) => setSize(Number(e.target.value), template.canvasHeight)}
            min={200}
            max={3000}
            className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Height (px)</label>
          <input
            type="number"
            value={template.canvasHeight}
            onChange={(e) => setSize(template.canvasWidth, Number(e.target.value))}
            min={200}
            max={3000}
            className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">Presets</label>
        <div className="space-y-1">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => setSize(p.w, p.h)}
              className={`w-full text-left px-2 py-1.5 text-sm rounded transition-colors ${
                template.canvasWidth === p.w && template.canvasHeight === p.h
                  ? 'bg-violet-100 text-violet-700'
                  : 'hover:bg-gray-50 text-gray-600'
              }`}
            >
              {p.label} <span className="text-gray-400">({p.w}x{p.h})</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">Background Color</label>
        <input
          type="color"
          value={template.backgroundColor}
          onChange={(e) => setBg(e.target.value)}
          className="w-full h-8 border border-gray-200 rounded cursor-pointer"
        />
      </div>
    </div>
  )
}
