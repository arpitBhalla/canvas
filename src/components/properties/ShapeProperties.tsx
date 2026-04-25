import { Square, Circle } from 'lucide-react'
import { useEditorStore } from '../../store/editorStore'
import type { ShapeElement } from '../../types'
import { Slider, SegmentedControl, ColorField } from './primitives'

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
      <SegmentedControl
        label="Shape"
        value={element.shape}
        onChange={(shape) => update({ shape })}
        options={[
          { value: 'rectangle', label: 'Rectangle', icon: <Square size={12} /> },
          { value: 'circle', label: 'Circle', icon: <Circle size={12} /> },
        ]}
      />

      <div className="grid grid-cols-2 gap-2">
        <ColorField label="Fill" value={element.fill} onChange={(fill) => update({ fill })} allowTransparent />
        <ColorField
          label="Stroke"
          value={element.stroke === 'transparent' ? '#000000' : element.stroke}
          onChange={(stroke) => update({ stroke })}
          allowTransparent
        />
      </div>

      <Slider
        label="Stroke width"
        value={element.strokeWidth}
        onChange={(strokeWidth) => update({ strokeWidth })}
        min={0}
        max={20}
        format={(v) => `${v} px`}
      />

      {element.shape === 'rectangle' && (
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
