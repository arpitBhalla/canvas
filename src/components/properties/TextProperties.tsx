import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from 'lucide-react'
import { useEditorStore } from '../../store/editorStore'
import type { TextElement } from '../../types'
import FontPicker from './FontPicker'
import { Field, Slider, SegmentedControl, ColorField } from './primitives'

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
      <Field label="Font family">
        <FontPicker value={element.fontFamily} onChange={(fontFamily) => update({ fontFamily })} />
      </Field>

      <div className="grid grid-cols-2 gap-2">
        <Field label="Size" hint="px">
          <input
            type="number"
            value={element.fontSize}
            onChange={(e) => update({ fontSize: Number(e.target.value) })}
            min={8}
            max={200}
            className="w-full h-8 border border-gray-200 rounded-md px-2 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
          />
        </Field>
        <Field label="Line height">
          <input
            type="number"
            value={element.lineHeight}
            onChange={(e) => update({ lineHeight: Number(e.target.value) })}
            min={0.5}
            max={3}
            step={0.1}
            className="w-full h-8 border border-gray-200 rounded-md px-2 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
          />
        </Field>
      </div>

      <Field label="Style">
        <div className="flex gap-1">
          <StyleToggle
            active={element.fontWeight === 'bold'}
            onClick={() => update({ fontWeight: element.fontWeight === 'bold' ? 'normal' : 'bold' })}
            label="Bold"
          >
            <Bold size={14} />
          </StyleToggle>
          <StyleToggle
            active={element.fontStyle === 'italic'}
            onClick={() => update({ fontStyle: element.fontStyle === 'italic' ? 'normal' : 'italic' })}
            label="Italic"
          >
            <Italic size={14} />
          </StyleToggle>
          <StyleToggle
            active={element.textDecoration === 'underline'}
            onClick={() =>
              update({ textDecoration: element.textDecoration === 'underline' ? 'none' : 'underline' })
            }
            label="Underline"
          >
            <Underline size={14} />
          </StyleToggle>
        </div>
      </Field>

      <SegmentedControl
        label="Alignment"
        value={element.textAlign}
        onChange={(textAlign) => update({ textAlign })}
        options={[
          { value: 'left', label: '', icon: <AlignLeft size={14} /> },
          { value: 'center', label: '', icon: <AlignCenter size={14} /> },
          { value: 'right', label: '', icon: <AlignRight size={14} /> },
        ]}
      />

      <div className="grid grid-cols-2 gap-2">
        <ColorField label="Color" value={element.color} onChange={(color) => update({ color })} />
        <ColorField
          label="Background"
          value={element.backgroundColor}
          onChange={(backgroundColor) => update({ backgroundColor })}
          allowTransparent
        />
      </div>

      <Slider
        label="Padding"
        value={element.padding}
        onChange={(padding) => update({ padding })}
        min={0}
        max={40}
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

function StyleToggle({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean
  onClick: () => void
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`flex-1 h-8 flex items-center justify-center rounded-md border transition-colors ${
        active
          ? 'bg-violet-50 border-violet-400 text-violet-700'
          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
      }`}
    >
      {children}
    </button>
  )
}
