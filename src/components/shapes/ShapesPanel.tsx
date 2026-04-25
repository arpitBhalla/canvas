import { useState } from 'react'
import { useEditorStore } from '../../store/editorStore'
import { SHAPE_PRESETS, type ShapePreset } from '../../constants/shapesLibrary'
import { pointsToD } from '../../utils/path'

const CATEGORIES: { id: ShapePreset['category'] | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'badge', label: 'Badges' },
  { id: 'ribbon', label: 'Ribbons' },
  { id: 'callout', label: 'Callouts' },
  { id: 'arrow', label: 'Arrows' },
  { id: 'misc', label: 'Misc' },
]

export default function ShapesPanel() {
  const [category, setCategory] = useState<ShapePreset['category'] | 'all'>('all')
  const template = useEditorStore((s) => s.template)
  const addPathFromCanvas = useEditorStore((s) => s.addPathFromCanvas)
  const updateElement = useEditorStore((s) => s.updateElement)
  const selectedElementIds = useEditorStore((s) => s.selectedElementIds)

  const filtered = category === 'all' ? SHAPE_PRESETS : SHAPE_PRESETS.filter((s) => s.category === category)

  function insert(preset: ShapePreset) {
    const offsetX = (template.canvasWidth - preset.width) / 2
    const offsetY = (template.canvasHeight - preset.height) / 2
    const canvasPoints = preset.points.map((p) => ({ x: p.x + offsetX, y: p.y + offsetY }))
    addPathFromCanvas(canvasPoints, 'straight', { closed: preset.closed })
    if (preset.defaultFill) {
      const newId = useEditorStore.getState().selectedElementIds[0]
      if (newId) {
        updateElement(newId, { stroke: preset.defaultFill, strokeWidth: 0, name: preset.name })
      }
    }
  }

  return (
    <div className="p-3 space-y-3">
      <div className="flex flex-wrap gap-1">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={`px-2 py-1 text-[11px] font-medium rounded-full border transition-colors ${
              category === c.id
                ? 'bg-violet-100 border-violet-300 text-violet-700'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {filtered.map((preset) => {
          const d = pointsToD(preset.points, 'straight', preset.closed)
          return (
            <button
              key={preset.id}
              onClick={() => insert(preset)}
              className="aspect-square bg-white border border-gray-200 hover:border-violet-400 hover:shadow-sm rounded-lg p-3 transition-all group"
              title={preset.name}
            >
              <svg
                viewBox={`-2 -2 ${preset.width + 4} ${preset.height + 4}`}
                preserveAspectRatio="xMidYMid meet"
                className="w-full h-full text-gray-600 group-hover:text-violet-600"
              >
                <path
                  d={d}
                  fill={preset.defaultFill ?? 'currentColor'}
                  stroke="none"
                />
              </svg>
            </button>
          )
        })}
      </div>

      {selectedElementIds.length === 0 && (
        <p className="text-[10px] text-gray-400 text-center pt-2">Click a shape to add it to the canvas.</p>
      )}
    </div>
  )
}
