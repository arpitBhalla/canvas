import { useRef } from 'react'
import { Upload, Variable } from 'lucide-react'
import { useEditorStore } from '../../store/editorStore'
import type { ImageElement } from '../../types'
import { Field, Slider, SegmentedControl } from './primitives'
import { isVariableToken, variableTokenName } from '../../utils/variables'

interface Props {
  element: ImageElement
}

export default function ImageProperties({ element }: Props) {
  const updateElement = useEditorStore((s) => s.updateElement)
  const dataSource = useEditorStore((s) => s.dataSource)
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

  const isVar = isVariableToken(element.src)
  const varName = variableTokenName(element.src)

  return (
    <>
      <Field label="Source">
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full h-8 flex items-center justify-center gap-1.5 text-xs font-medium border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
        >
          <Upload size={13} />
          {element.src && !isVar ? 'Replace image' : 'Upload image'}
        </button>
      </Field>

      <Field label="Or paste URL">
        <input
          type="text"
          value={element.src.startsWith('data:') ? '' : element.src}
          onChange={(e) => update({ src: e.target.value })}
          placeholder="https://… or {{column}}"
          className="w-full h-8 border border-gray-200 rounded-md px-2 text-xs focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
        />
      </Field>

      <Field label="Or bind to a column">
        <select
          value={isVar && varName ? varName : ''}
          onChange={(e) => {
            const v = e.target.value
            update({ src: v ? `{{${v}}}` : '' })
          }}
          className="w-full h-8 border border-gray-200 rounded-md px-2 text-xs bg-white focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
        >
          <option value="">— pick a column —</option>
          {(dataSource?.headers ?? []).map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
        {isVar && varName && (
          <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-violet-100 text-violet-700 rounded">
            <Variable size={10} /> {`{{${varName}}}`}
          </div>
        )}
        {!dataSource && (
          <p className="text-[10px] text-gray-400 mt-1">Connect data first to bind.</p>
        )}
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

      <div className="pt-3 border-t border-gray-100 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-gray-600">Filters</span>
          {element.filters && (
            <button
              onClick={() => update({ filters: undefined })}
              className="text-[11px] text-gray-400 hover:text-gray-700"
            >
              Reset
            </button>
          )}
        </div>
        <Slider
          label="Brightness"
          value={element.filters?.brightness ?? 100}
          onChange={(v) => update({ filters: { ...element.filters, brightness: v } })}
          min={0}
          max={200}
          format={(v) => `${v}%`}
        />
        <Slider
          label="Contrast"
          value={element.filters?.contrast ?? 100}
          onChange={(v) => update({ filters: { ...element.filters, contrast: v } })}
          min={0}
          max={200}
          format={(v) => `${v}%`}
        />
        <Slider
          label="Saturation"
          value={element.filters?.saturate ?? 100}
          onChange={(v) => update({ filters: { ...element.filters, saturate: v } })}
          min={0}
          max={200}
          format={(v) => `${v}%`}
        />
        <Slider
          label="Blur"
          value={element.filters?.blur ?? 0}
          onChange={(v) => update({ filters: { ...element.filters, blur: v } })}
          min={0}
          max={20}
          format={(v) => `${v} px`}
        />
      </div>
    </>
  )
}
