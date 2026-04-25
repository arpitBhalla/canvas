import { Square, Circle, Triangle, Star, Minus, MoveRight } from 'lucide-react'
import { useEditorStore } from '../../store/editorStore'
import type { ShapeElement, ShapeKind } from '../../types'
import { Field, Slider, ColorField } from './primitives'
import GradientField from './GradientField'

interface Props {
  element: ShapeElement
}

const SHAPE_OPTIONS: { value: ShapeKind; icon: React.ReactNode; label: string }[] = [
  { value: 'rectangle', icon: <Square size={14} />, label: 'Rectangle' },
  { value: 'circle', icon: <Circle size={14} />, label: 'Circle' },
  { value: 'triangle', icon: <Triangle size={14} />, label: 'Triangle' },
  { value: 'star', icon: <Star size={14} />, label: 'Star' },
  { value: 'line', icon: <Minus size={14} />, label: 'Line' },
  { value: 'arrow', icon: <MoveRight size={14} />, label: 'Arrow' },
]

export default function ShapeProperties({ element }: Props) {
  const updateElement = useEditorStore((s) => s.updateElement)

  function update(updates: Partial<ShapeElement>) {
    updateElement(element.id, updates)
  }

  const isStroked = element.shape === 'line' || element.shape === 'arrow'
  const supportsRadius = element.shape === 'rectangle'
  const supportsBorder = !isStroked && element.shape !== 'triangle' && element.shape !== 'star'

  return (
    <>
      <Field label="Shape">
        <div className="grid grid-cols-3 gap-1">
          {SHAPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => update({ shape: opt.value })}
              title={opt.label}
              className={`h-9 flex items-center justify-center border rounded-md transition-colors ${
                element.shape === opt.value
                  ? 'bg-violet-50 border-violet-300 text-violet-700'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {opt.icon}
            </button>
          ))}
        </div>
      </Field>

      {!isStroked && (
        <GradientField
          gradient={element.gradient}
          fallback={element.fill}
          onChange={(gradient) => update({ gradient })}
        />
      )}

      {!isStroked && !element.gradient && (
        <ColorField label="Fill" value={element.fill} onChange={(fill) => update({ fill })} allowTransparent />
      )}

      {(supportsBorder || isStroked) && (
        <ColorField
          label={isStroked ? 'Color' : 'Stroke'}
          value={element.stroke === 'transparent' ? '#000000' : element.stroke}
          onChange={(stroke) => update({ stroke })}
          allowTransparent={!isStroked}
        />
      )}

      <Slider
        label={isStroked ? 'Thickness' : 'Stroke width'}
        value={element.strokeWidth || (isStroked ? 2 : 0)}
        onChange={(strokeWidth) => update({ strokeWidth })}
        min={0}
        max={20}
        format={(v) => `${v} px`}
      />

      {supportsRadius && (
        <Slider
          label="Border radius"
          value={element.borderRadius}
          onChange={(borderRadius) => update({ borderRadius })}
          min={0}
          max={100}
          format={(v) => `${v} px`}
        />
      )}

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
