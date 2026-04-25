import { useEditorStore } from '../../store/editorStore'
import type { CanvasElement, ShadowConfig } from '../../types'
import { Field, Slider, ColorField } from './primitives'

const DEFAULT_SHADOW: ShadowConfig = { x: 0, y: 4, blur: 12, color: 'rgba(0,0,0,0.2)' }

interface Props {
  element: CanvasElement
}

export default function ShadowField({ element }: Props) {
  const updateElement = useEditorStore((s) => s.updateElement)
  const enabled = !!element.shadow
  const shadow = element.shadow ?? DEFAULT_SHADOW

  function update(patch: Partial<ShadowConfig>) {
    updateElement(element.id, { shadow: { ...shadow, ...patch } })
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-gray-600">Shadow</span>
        <button
          onClick={() =>
            updateElement(element.id, { shadow: enabled ? undefined : DEFAULT_SHADOW })
          }
          className={`h-6 px-2 text-[11px] font-medium rounded-md border transition-colors ${
            enabled
              ? 'bg-violet-50 border-violet-300 text-violet-700'
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          {enabled ? 'On' : 'Off'}
        </button>
      </div>
      {enabled && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Field label="Offset X" hint={`${shadow.x} px`}>
              <input
                type="range"
                value={shadow.x}
                onChange={(e) => update({ x: Number(e.target.value) })}
                min={-40}
                max={40}
                className="slider"
                style={{ ['--fill' as string]: `${((shadow.x + 40) / 80) * 100}%` }}
              />
            </Field>
            <Field label="Offset Y" hint={`${shadow.y} px`}>
              <input
                type="range"
                value={shadow.y}
                onChange={(e) => update({ y: Number(e.target.value) })}
                min={-40}
                max={40}
                className="slider"
                style={{ ['--fill' as string]: `${((shadow.y + 40) / 80) * 100}%` }}
              />
            </Field>
          </div>
          <Slider
            label="Blur"
            value={shadow.blur}
            onChange={(blur) => update({ blur })}
            min={0}
            max={80}
            format={(v) => `${v} px`}
          />
          <ColorField label="Color" value={shadow.color} onChange={(color) => update({ color })} />
        </div>
      )}
    </div>
  )
}
