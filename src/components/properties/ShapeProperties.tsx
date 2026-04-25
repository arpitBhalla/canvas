import { useEditorStore } from '../../store/editorStore'
import type { ShapeElement } from '../../types'

interface Props {
  element: ShapeElement
}

export default function ShapeProperties({ element }: Props) {
  const updateElement = useEditorStore((s) => s.updateElement)

  function update(updates: Partial<ShapeElement>) {
    updateElement(element.id, updates)
  }

  return (
    <>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Shape</label>
        <div className="grid grid-cols-2 gap-1">
          {(['rectangle', 'circle'] as const).map((shape) => (
            <button
              key={shape}
              onClick={() => update({ shape })}
              className={`py-1.5 text-sm rounded border capitalize transition-colors ${
                element.shape === shape ? 'bg-gray-200 border-gray-300' : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              {shape}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Fill</label>
          <input
            type="color"
            value={element.fill}
            onChange={(e) => update({ fill: e.target.value })}
            className="w-full h-8 border border-gray-200 rounded cursor-pointer"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Stroke</label>
          <input
            type="color"
            value={element.stroke === 'transparent' ? '#000000' : element.stroke}
            onChange={(e) => update({ stroke: e.target.value })}
            className="w-full h-8 border border-gray-200 rounded cursor-pointer"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">Stroke Width</label>
        <input
          type="range"
          value={element.strokeWidth}
          onChange={(e) => update({ strokeWidth: Number(e.target.value) })}
          min={0}
          max={20}
          className="w-full"
        />
      </div>

      {element.shape === 'rectangle' && (
        <div>
          <label className="block text-xs text-gray-500 mb-1">Border Radius</label>
          <input
            type="range"
            value={element.borderRadius}
            onChange={(e) => update({ borderRadius: Number(e.target.value) })}
            min={0}
            max={100}
            className="w-full"
          />
        </div>
      )}

      <div>
        <label className="block text-xs text-gray-500 mb-1">Opacity</label>
        <input
          type="range"
          value={element.opacity}
          onChange={(e) => update({ opacity: Number(e.target.value) })}
          min={0}
          max={1}
          step={0.05}
          className="w-full"
        />
      </div>
    </>
  )
}
