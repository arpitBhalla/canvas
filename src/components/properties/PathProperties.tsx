import { useEditorStore } from '../../store/editorStore'
import type { PathElement, ArrowEnd } from '../../types'
import { Field, Slider, ColorField, SegmentedControl } from './primitives'

interface Props {
  element: PathElement
}

export default function PathProperties({ element }: Props) {
  const updateElement = useEditorStore((s) => s.updateElement)

  function update(patch: Partial<PathElement>) {
    updateElement(element.id, patch)
  }

  return (
    <>
      <SegmentedControl
        label="Mode"
        value={element.mode}
        onChange={(mode) => update({ mode })}
        options={[
          { value: 'straight', label: 'Straight' },
          { value: 'curve', label: 'Curve' },
          { value: 'freehand', label: 'Free' },
        ]}
      />

      <ColorField label="Stroke" value={element.stroke} onChange={(stroke) => update({ stroke })} />

      <Slider
        label="Thickness"
        value={element.strokeWidth}
        onChange={(strokeWidth) => update({ strokeWidth })}
        min={1}
        max={30}
        format={(v) => `${v} px`}
      />

      <SegmentedControl
        label="Arrowhead"
        value={(element.arrowhead ?? 'none') as ArrowEnd}
        onChange={(arrowhead) => update({ arrowhead })}
        options={[
          { value: 'none', label: 'None' },
          { value: 'end', label: 'End' },
          { value: 'both', label: 'Both' },
        ]}
      />

      <Field label="Closed">
        <button
          onClick={() => update({ closed: !element.closed })}
          className={`w-full h-8 text-xs font-medium border rounded-md transition-colors ${
            element.closed
              ? 'bg-violet-50 border-violet-300 text-violet-700'
              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          {element.closed ? 'Closed shape' : 'Open path'}
        </button>
      </Field>

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
