import { useEditorStore } from '../../store/editorStore'
import type { TextElement } from '../../types'
import FontPicker from './FontPicker'

interface Props {
  element: TextElement
}

export default function TextProperties({ element }: Props) {
  const updateElement = useEditorStore((s) => s.updateElement)

  function update(updates: Partial<TextElement>) {
    updateElement(element.id, updates)
  }

  return (
    <>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Font Family</label>
        <FontPicker
          value={element.fontFamily}
          onChange={(fontFamily) => update({ fontFamily })}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Size</label>
          <input
            type="number"
            value={element.fontSize}
            onChange={(e) => update({ fontSize: Number(e.target.value) })}
            min={8}
            max={200}
            className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Line Height</label>
          <input
            type="number"
            value={element.lineHeight}
            onChange={(e) => update({ lineHeight: Number(e.target.value) })}
            min={0.5}
            max={3}
            step={0.1}
            className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1">
        <button
          onClick={() => update({ fontWeight: element.fontWeight === 'bold' ? 'normal' : 'bold' })}
          className={`py-1.5 text-sm rounded border transition-colors ${
            element.fontWeight === 'bold' ? 'bg-gray-200 border-gray-300 font-bold' : 'border-gray-200 hover:bg-gray-50'
          }`}
        >
          B
        </button>
        <button
          onClick={() => update({ fontStyle: element.fontStyle === 'italic' ? 'normal' : 'italic' })}
          className={`py-1.5 text-sm rounded border transition-colors italic ${
            element.fontStyle === 'italic' ? 'bg-gray-200 border-gray-300' : 'border-gray-200 hover:bg-gray-50'
          }`}
        >
          I
        </button>
        <button
          onClick={() => update({ textDecoration: element.textDecoration === 'underline' ? 'none' : 'underline' })}
          className={`py-1.5 text-sm rounded border transition-colors underline ${
            element.textDecoration === 'underline' ? 'bg-gray-200 border-gray-300' : 'border-gray-200 hover:bg-gray-50'
          }`}
        >
          U
        </button>
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">Alignment</label>
        <div className="grid grid-cols-3 gap-1">
          {(['left', 'center', 'right'] as const).map((align) => (
            <button
              key={align}
              onClick={() => update({ textAlign: align })}
              className={`py-1.5 text-sm rounded border capitalize transition-colors ${
                element.textAlign === align ? 'bg-gray-200 border-gray-300' : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              {align}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Color</label>
          <input
            type="color"
            value={element.color}
            onChange={(e) => update({ color: e.target.value })}
            className="w-full h-8 border border-gray-200 rounded cursor-pointer"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Background</label>
          <div className="flex gap-1">
            <input
              type="color"
              value={element.backgroundColor === 'transparent' ? '#ffffff' : element.backgroundColor}
              onChange={(e) => update({ backgroundColor: e.target.value })}
              className="flex-1 h-8 border border-gray-200 rounded cursor-pointer"
            />
            <button
              onClick={() => update({ backgroundColor: 'transparent' })}
              className="px-1.5 text-xs border border-gray-200 rounded hover:bg-gray-50"
              title="Transparent"
            >
              &#8709;
            </button>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">Padding</label>
        <input
          type="range"
          value={element.padding}
          onChange={(e) => update({ padding: Number(e.target.value) })}
          min={0}
          max={40}
          className="w-full"
        />
      </div>

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
