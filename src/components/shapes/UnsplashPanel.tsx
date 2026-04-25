import { useEffect, useState } from 'react'
import { Search, Loader2, ExternalLink, KeyRound } from 'lucide-react'
import { useEditorStore } from '../../store/editorStore'

const STORAGE_KEY = 'imprintly-unsplash-key'

interface UnsplashPhoto {
  id: string
  urls: { small: string; regular: string; full: string }
  width: number
  height: number
  user: { name: string; links: { html: string } }
  alt_description?: string | null
  links: { html: string }
}

export default function UnsplashPanel() {
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem(STORAGE_KEY) ?? '')
  const [showSetup, setShowSetup] = useState(false)
  const [keyDraft, setKeyDraft] = useState(apiKey)
  const [query, setQuery] = useState('')
  const [photos, setPhotos] = useState<UnsplashPhoto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const template = useEditorStore((s) => s.template)
  const addElement = useEditorStore((s) => s.addElement)

  useEffect(() => {
    if (!apiKey || query.trim().length === 0) return
    const handle = setTimeout(() => {
      runSearch(query)
    }, 300)
    return () => clearTimeout(handle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, apiKey])

  function saveKey() {
    const trimmed = keyDraft.trim()
    if (!trimmed) return
    localStorage.setItem(STORAGE_KEY, trimmed)
    setApiKey(trimmed)
    setShowSetup(false)
  }

  function clearKey() {
    localStorage.removeItem(STORAGE_KEY)
    setApiKey('')
    setKeyDraft('')
    setShowSetup(true)
  }

  async function runSearch(q: string) {
    setLoading(true)
    setError(null)
    try {
      const url = `https://api.unsplash.com/search/photos?per_page=24&query=${encodeURIComponent(q)}`
      const res = await fetch(url, {
        headers: { Authorization: `Client-ID ${apiKey}` },
      })
      if (!res.ok) throw new Error(`Unsplash returned ${res.status}`)
      const data = (await res.json()) as { results: UnsplashPhoto[] }
      setPhotos(data.results)
    } catch (err) {
      setError((err as Error).message)
      setPhotos([])
    } finally {
      setLoading(false)
    }
  }

  function addPhoto(photo: UnsplashPhoto) {
    const ratio = Math.min(
      1,
      template.canvasWidth / photo.width,
      template.canvasHeight / photo.height
    )
    const width = Math.round(photo.width * ratio * 0.6)
    const height = Math.round(photo.height * ratio * 0.6)
    const x = (template.canvasWidth - width) / 2
    const y = (template.canvasHeight - height) / 2
    addElement('image', {
      src: photo.urls.regular,
      size: { width, height },
      position: { x, y },
      naturalWidth: photo.width,
      naturalHeight: photo.height,
      name: photo.alt_description ?? `Unsplash by ${photo.user.name}`,
    })
  }

  if (!apiKey || showSetup) {
    return (
      <div className="p-3 space-y-3">
        <div className="flex items-center gap-2">
          <KeyRound size={14} className="text-violet-600" />
          <h3 className="text-xs font-semibold text-gray-700">Unsplash setup</h3>
        </div>
        <p className="text-[11px] text-gray-500 leading-relaxed">
          Paste your Unsplash <span className="font-medium text-gray-700">Access Key</span> to enable
          stock photo search. Get one free at{' '}
          <a
            href="https://unsplash.com/oauth/applications"
            target="_blank"
            rel="noreferrer"
            className="text-violet-600 hover:underline inline-flex items-center gap-0.5"
          >
            unsplash.com <ExternalLink size={10} />
          </a>
          .
        </p>
        <input
          type="password"
          value={keyDraft}
          onChange={(e) => setKeyDraft(e.target.value)}
          placeholder="Access Key"
          className="w-full h-8 border border-gray-200 rounded-md px-2 text-xs focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
        />
        <div className="flex gap-2">
          {apiKey && (
            <button
              onClick={() => setShowSetup(false)}
              className="flex-1 h-8 text-xs font-medium border border-gray-200 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
          <button
            onClick={saveKey}
            disabled={!keyDraft.trim()}
            className="flex-1 h-8 text-xs font-medium bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-40"
          >
            Save key
          </button>
        </div>
        <p className="text-[10px] text-gray-400">Stored locally in your browser only.</p>
      </div>
    )
  }

  return (
    <div className="p-3 space-y-3">
      <div className="relative">
        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Unsplash"
          className="w-full h-8 pl-8 pr-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 text-gray-400">
          <Loader2 size={16} className="animate-spin" />
        </div>
      )}

      {error && (
        <p className="text-[11px] text-red-700 bg-red-50 border border-red-200 p-2 rounded-md">{error}</p>
      )}

      {!loading && !error && query.trim() === '' && (
        <p className="text-[11px] text-gray-400 text-center py-4">
          Type a keyword to search free stock photos.
        </p>
      )}

      {!loading && !error && query.trim() !== '' && photos.length === 0 && (
        <p className="text-[11px] text-gray-400 text-center py-4">No results.</p>
      )}

      <div className="grid grid-cols-2 gap-1.5">
        {photos.map((p) => (
          <button
            key={p.id}
            onClick={() => addPhoto(p)}
            title={p.alt_description ?? `Photo by ${p.user.name}`}
            className="relative aspect-square overflow-hidden rounded-md bg-gray-100 hover:ring-2 hover:ring-violet-400 transition-all"
          >
            <img
              src={p.urls.small}
              alt={p.alt_description ?? ''}
              loading="lazy"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent text-white text-[9px] px-1.5 py-1 opacity-0 hover:opacity-100 transition-opacity truncate">
              {p.user.name}
            </div>
          </button>
        ))}
      </div>

      {photos.length > 0 && (
        <div className="flex items-center justify-between pt-1 border-t border-gray-100 text-[10px] text-gray-400">
          <a
            href="https://unsplash.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-violet-600"
          >
            via Unsplash
          </a>
          <button onClick={clearKey} className="hover:text-violet-600">Reset key</button>
        </div>
      )}
    </div>
  )
}
