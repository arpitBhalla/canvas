import { useEffect, useRef, useState } from 'react'

interface FieldProps {
  label: string
  hint?: string
  children: React.ReactNode
}

export function Field({ label, hint, children }: FieldProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[11px] font-medium text-gray-600">{label}</label>
        {hint && <span className="text-[11px] text-gray-400 tabular-nums">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

interface SliderProps {
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
  label: string
  format?: (v: number) => string
}

export function Slider({ value, min, max, step = 1, onChange, label, format }: SliderProps) {
  const fill = ((value - min) / (max - min)) * 100
  const display = format ? format(value) : `${value}`
  return (
    <Field label={label} hint={display}>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="slider"
        style={{ ['--fill' as string]: `${fill}%` }}
      />
    </Field>
  )
}

interface SegmentedControlProps<T extends string> {
  value: T
  options: { value: T; label: string; icon?: React.ReactNode }[]
  onChange: (v: T) => void
  label?: string
}

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  label,
}: SegmentedControlProps<T>) {
  const content = (
    <div className="flex p-0.5 bg-gray-100 rounded-lg">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 text-xs font-medium rounded-md transition-all capitalize ${
            value === opt.value
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {opt.icon}
          {opt.label}
        </button>
      ))}
    </div>
  )
  if (label) return <Field label={label}>{content}</Field>
  return content
}

interface ColorFieldProps {
  label: string
  value: string
  onChange: (v: string) => void
  allowTransparent?: boolean
}

function normalizeHex(input: string): string | null {
  const v = input.trim().toLowerCase()
  if (!v) return null
  const hex = v.startsWith('#') ? v : `#${v}`
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/.test(hex)) {
    if (hex.length === 4) {
      return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
    }
    return hex
  }
  return null
}

export function ColorField({ label, value, onChange, allowTransparent }: ColorFieldProps) {
  const isTransparent = value === 'transparent'
  const [open, setOpen] = useState(false)
  const [hex, setHex] = useState(isTransparent ? '' : value)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setHex(isTransparent ? '' : value)
  }, [value, isTransparent])

  useEffect(() => {
    if (!open) return
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  function commitHex(input: string) {
    const next = normalizeHex(input)
    if (next) onChange(next)
    else setHex(isTransparent ? '' : value)
  }

  return (
    <Field label={label}>
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center gap-2 h-8 px-1.5 border border-gray-200 hover:border-gray-300 rounded-md text-xs transition-colors"
        >
          <span
            className="w-5 h-5 rounded shrink-0 border border-black/10"
            style={{
              backgroundColor: isTransparent ? 'transparent' : value,
              backgroundImage: isTransparent
                ? 'repeating-conic-gradient(#cbd5e1 0% 25%, #fff 0% 50%) 50% / 8px 8px'
                : undefined,
            }}
          />
          <span className="font-mono text-gray-700 flex-1 text-left truncate">
            {isTransparent ? 'transparent' : value.toUpperCase()}
          </span>
        </button>

        {open && (
          <div className="absolute z-30 left-0 right-0 mt-1 p-3 bg-white border border-gray-200 rounded-lg shadow-xl space-y-2">
            <input
              type="color"
              value={isTransparent ? '#ffffff' : value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full h-24 rounded cursor-pointer border border-gray-200"
            />
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-gray-400 font-mono">#</span>
              <input
                type="text"
                value={hex.replace(/^#/, '')}
                onChange={(e) => setHex(e.target.value)}
                onBlur={(e) => commitHex(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                }}
                placeholder="000000"
                className="flex-1 text-xs font-mono border border-gray-200 rounded px-1.5 py-1 focus:outline-none focus:border-violet-400"
              />
            </div>
            {allowTransparent && (
              <button
                onClick={() => {
                  onChange('transparent')
                  setOpen(false)
                }}
                className="w-full text-xs py-1.5 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
              >
                {isTransparent ? '✓ Transparent' : 'Set transparent'}
              </button>
            )}
          </div>
        )}
      </div>
    </Field>
  )
}
