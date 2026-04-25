import { useEditorStore } from '../../store/editorStore'
import { Field, ColorField } from './primitives'

const PRESETS = [
  { label: 'A4 Portrait', w: 794, h: 1123 },
  { label: 'A4 Landscape', w: 1123, h: 794 },
  { label: 'Letter', w: 816, h: 1056 },
  { label: 'Full HD', w: 1920, h: 1080 },
  { label: 'Square', w: 1080, h: 1080 },
  { label: 'Story', w: 1080, h: 1920 },
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
      <Field label="Template name">
        <input
          type="text"
          value={template.name}
          onChange={(e) => setName(e.target.value)}
          className="w-full h-8 border border-gray-200 rounded-md px-2 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
        />
      </Field>

      <div className="grid grid-cols-2 gap-2">
        <Field label="Width" hint="px">
          <input
            type="number"
            value={template.canvasWidth}
            onChange={(e) => setSize(Number(e.target.value), template.canvasHeight)}
            min={200}
            max={3000}
            className="w-full h-8 border border-gray-200 rounded-md px-2 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
          />
        </Field>
        <Field label="Height" hint="px">
          <input
            type="number"
            value={template.canvasHeight}
            onChange={(e) => setSize(template.canvasWidth, Number(e.target.value))}
            min={200}
            max={3000}
            className="w-full h-8 border border-gray-200 rounded-md px-2 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
          />
        </Field>
      </div>

      <Field label="Presets">
        <div className="grid grid-cols-2 gap-1.5">
          {PRESETS.map((p) => {
            const active = template.canvasWidth === p.w && template.canvasHeight === p.h
            return (
              <button
                key={p.label}
                onClick={() => setSize(p.w, p.h)}
                className={`text-left px-2 py-1.5 rounded-md border transition-colors ${
                  active
                    ? 'bg-violet-50 border-violet-300 text-violet-700'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="text-xs font-medium">{p.label}</div>
                <div className="text-[10px] text-gray-400">
                  {p.w}×{p.h}
                </div>
              </button>
            )
          })}
        </div>
      </Field>

      <ColorField label="Background" value={template.backgroundColor} onChange={setBg} />
    </div>
  )
}
