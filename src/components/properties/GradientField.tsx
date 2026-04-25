import type { GradientConfig } from '../../types'
import { Field, ColorField } from './primitives'

interface Props {
  gradient: GradientConfig | undefined
  fallback: string
  onChange: (gradient: GradientConfig | undefined) => void
}

const PRESETS: GradientConfig[] = [
  { from: '#a78bfa', to: '#ec4899', angle: 135 },
  { from: '#0ea5e9', to: '#14b8a6', angle: 135 },
  { from: '#f97316', to: '#facc15', angle: 135 },
  { from: '#1f2937', to: '#6b7280', angle: 135 },
  { from: '#fb7185', to: '#fbbf24', angle: 135 },
  { from: '#22c55e', to: '#0ea5e9', angle: 135 },
]

export default function GradientField({ gradient, fallback, onChange }: Props) {
  const enabled = !!gradient
  const g: GradientConfig = gradient ?? { from: fallback || '#a78bfa', to: '#ec4899', angle: 135 }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-gray-600">Gradient</span>
        <button
          onClick={() => onChange(enabled ? undefined : g)}
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
            <ColorField label="From" value={g.from} onChange={(from) => onChange({ ...g, from })} />
            <ColorField label="To" value={g.to} onChange={(to) => onChange({ ...g, to })} />
          </div>
          <Field label="Angle" hint={`${g.angle}°`}>
            <input
              type="range"
              value={g.angle}
              onChange={(e) => onChange({ ...g, angle: Number(e.target.value) })}
              min={0}
              max={360}
              className="slider"
              style={{ ['--fill' as string]: `${(g.angle / 360) * 100}%` }}
            />
          </Field>
          <Field label="Presets">
            <div className="grid grid-cols-6 gap-1.5">
              {PRESETS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => onChange(p)}
                  title={`${p.from} → ${p.to}`}
                  className="h-7 rounded-md border border-gray-200 hover:ring-2 hover:ring-violet-300 transition-all"
                  style={{ background: `linear-gradient(${p.angle}deg, ${p.from}, ${p.to})` }}
                />
              ))}
            </div>
          </Field>
        </div>
      )}
    </div>
  )
}
