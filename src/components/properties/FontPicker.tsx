import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { GOOGLE_FONTS, fontFamilyStack } from '../../constants/googleFonts'
import { loadGoogleFont } from '../../utils/fonts'

interface Props {
  value: string
  onChange: (family: string) => void
}

function bareFamily(value: string): string {
  return value.replace(/['"]/g, '').split(',')[0]?.trim() ?? ''
}

export default function FontPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)
  const current = bareFamily(value)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return GOOGLE_FONTS
    return GOOGLE_FONTS.filter((f) => f.family.toLowerCase().includes(q))
  }, [query])

  useEffect(() => {
    if (!open) return
    GOOGLE_FONTS.forEach((f) => loadGoogleFont(f.family, [400]))
    function onDoc(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  function pick(family: string) {
    const font = GOOGLE_FONTS.find((f) => f.family === family)
    loadGoogleFont(family, font?.weights)
    onChange(fontFamilyStack(family, font?.category))
    setOpen(false)
    setQuery('')
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 border border-gray-200 rounded px-2 py-1.5 text-sm hover:border-gray-300"
      >
        <span className="truncate" style={{ fontFamily: value }}>
          {current || 'Default'}
        </span>
        <ChevronDown size={14} className="text-gray-400 shrink-0" />
      </button>

      {open && (
        <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-100 flex items-center gap-2">
            <Search size={14} className="text-gray-400" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search fonts..."
              className="flex-1 text-sm focus:outline-none"
            />
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-xs text-gray-400 text-center">No fonts match</div>
            ) : (
              filtered.map((f) => (
                <button
                  key={f.family}
                  onClick={() => pick(f.family)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${
                    current === f.family ? 'bg-violet-50 text-violet-700' : 'text-gray-800'
                  }`}
                  style={{ fontFamily: fontFamilyStack(f.family, f.category) }}
                >
                  <span>{f.family}</span>
                  <span className="text-[10px] text-gray-400" style={{ fontFamily: 'system-ui, sans-serif' }}>
                    {f.category}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
