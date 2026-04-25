import { useRef } from 'react'
import { Upload } from 'lucide-react'
import { useEditorStore } from '../../store/editorStore'
import type { ImageElement } from '../../types'
import { Field, Slider, SegmentedControl } from './primitives'

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
    reader.onload = () => update({ src: reader.result as string })
    reader.readAsDataURL(file)
  }

  return (
    <>
      <Field label="Source">
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full h-8 flex items-center justify-center gap-1.5 text-xs font-medium border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
        >
          <Upload size={13} />
          {element.src ? 'Replace image' : 'Upload image'}
        </button>
      </Field>

      <Field label="Or paste URL">
        <input
          type="text"
          value={element.src.startsWith('data:') ? '' : element.src}
          onChange={(e) => update({ src: e.target.value })}
          placeholder="https://…"
          className="w-full h-8 border border-gray-200 rounded-md px-2 text-xs focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
        />
      </Field>

      <SegmentedControl
        label="Object fit"
        value={element.objectFit}
        onChange={(objectFit) => update({ objectFit })}
        options={[
          { value: 'cover', label: 'Cover' },
          { value: 'contain', label: 'Contain' },
          { value: 'fill', label: 'Fill' },
        ]}
      />

      <Slider
        label="Border radius"
        value={element.borderRadius}
        onChange={(borderRadius) => update({ borderRadius })}
        min={0}
        max={100}
        format={(v) => `${v} px`}
      />

      <Slider
        label="Opacity"
        value={element.opacity}
        onChange={(opacity) => update({ opacity })}
        min={0}
        max={1}
        step={0.05}
        format={(v) => `${Math.round(v * 100)}%`}
      />
    </>
  )
}
