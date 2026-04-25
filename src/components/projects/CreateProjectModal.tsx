import { useState } from 'react'
import { X } from 'lucide-react'
import { useProjectsStore } from '../../store/projectsStore'
import { useNavigate } from 'react-router-dom'

const SIZE_PRESETS = [
  { label: 'A4 Portrait', width: 794, height: 1123 },
  { label: 'A4 Landscape', width: 1123, height: 794 },
  { label: 'Letter', width: 816, height: 1056 },
  { label: 'HD (1920×1080)', width: 1920, height: 1080 },
  { label: '1200×900', width: 1200, height: 900 },
  { label: '800×600', width: 800, height: 600 },
]

interface Props {
  onClose: () => void
}

export default function CreateProjectModal({ onClose }: Props) {
  const navigate = useNavigate()
  const createProject = useProjectsStore((s) => s.createProject)
  const [name, setName] = useState('')
  const [presetIdx, setPresetIdx] = useState(4)

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const preset = SIZE_PRESETS[presetIdx]!
    const project = createProject(name || 'Untitled Project', { width: preset.width, height: preset.height })
    onClose()
    navigate(`/project/${project.id}`)
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleCreate}
        className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">New project</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Name</label>
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My new design"
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Canvas size</label>
          <div className="grid grid-cols-2 gap-2">
            {SIZE_PRESETS.map((p, i) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setPresetIdx(i)}
                className={`text-left px-3 py-2 text-sm rounded border transition-colors ${
                  i === presetIdx
                    ? 'bg-violet-50 border-violet-500 text-violet-700'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="font-medium">{p.label}</div>
                <div className="text-xs text-gray-400">
                  {p.width}×{p.height}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm bg-violet-600 text-white rounded hover:bg-violet-700"
          >
            Create
          </button>
        </div>
      </form>
    </div>
  )
}
