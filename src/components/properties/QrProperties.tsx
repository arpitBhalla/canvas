import { Variable } from 'lucide-react'
import { useEditorStore } from '../../store/editorStore'
import type { QrElement, QrErrorCorrectionLevel } from '../../types'
import { Field, Slider, ColorField, SegmentedControl } from './primitives'
import { isVariableToken, variableTokenName } from '../../utils/variables'

interface Props {
  element: QrElement
}

export default function QrProperties({ element }: Props) {
  const updateElement = useEditorStore((s) => s.updateElement)
  const dataSource = useEditorStore((s) => s.dataSource)

  function update(patch: Partial<QrElement>) {
    updateElement(element.id, patch)
  }

  const isVar = isVariableToken(element.value)
  const varName = variableTokenName(element.value)

  return (
    <>
      <Field label="Value">
        <input
          type="text"
          value={element.value}
          onChange={(e) => update({ value: e.target.value })}
          placeholder="https://example.com or {{column}}"
          className="w-full h-8 border border-gray-200 rounded-md px-2 text-xs focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
        />
      </Field>

      <Field label="Or bind to a column">
        <select
          value={isVar && varName ? varName : ''}
          onChange={(e) => update({ value: e.target.value ? `{{${e.target.value}}}` : '' })}
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
        label="Error correction"
        value={element.level}
        onChange={(level) => update({ level: level as QrErrorCorrectionLevel })}
        options={[
          { value: 'L', label: 'Low' },
          { value: 'M', label: 'Med' },
          { value: 'Q', label: 'Quart' },
          { value: 'H', label: 'High' },
        ]}
      />

      <div className="grid grid-cols-2 gap-2">
        <ColorField label="Foreground" value={element.foreground} onChange={(c) => update({ foreground: c })} />
        <ColorField
          label="Background"
          value={element.background}
          onChange={(c) => update({ background: c })}
          allowTransparent
        />
      </div>

      <Slider
        label="Margin"
        value={element.margin}
        onChange={(margin) => update({ margin })}
        min={0}
        max={6}
        format={(v) => `${v}`}
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
