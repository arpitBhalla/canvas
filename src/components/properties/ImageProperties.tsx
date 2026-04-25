import { useRef } from 'react'
import { useEditorStore } from '../../store/editorStore'
import type { ImageElement } from '../../types'

interface Props {
  element: ImageElement
}

export default function ImageProperties({ element }: Props) {
  const updateElement = useEditorStore((s) => s.updateElement)
  const fileRef = useRef<HTMLInputElement>(null)

  function update(updates: Partial<ImageElement>) {
    updateElement(element.id, updates)
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      update({ src: reader.result as string })
    }
    reader.readAsDataURL(file)
  }

  return (
    <>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Image Source</label>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full py-2 text-sm border border-gray-200 rounded hover:bg-gray-50 transition-colors"
        >
          Upload Image
        </button>
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">Or paste URL</label>
        <input
          type="text"
          value={element.src.startsWith('data:') ? '' : element.src}
          onChange={(e) => update({ src: e.target.value })}
          placeholder="https://..."
          className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">Object Fit</label>
        <div className="grid grid-cols-3 gap-1">
          {(['cover', 'contain', 'fill'] as const).map((fit) => (
            <button
              key={fit}
              onClick={() => update({ objectFit: fit })}
              className={`py-1.5 text-sm rounded border capitalize transition-colors ${
                element.objectFit === fit ? 'bg-gray-200 border-gray-300' : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              {fit}
            </button>
          ))}
        </div>
      </div>

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
