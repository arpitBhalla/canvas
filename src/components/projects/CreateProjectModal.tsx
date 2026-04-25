import { useState } from 'react'
import { X, FileText, Award, IdCard, Sparkles, Square } from 'lucide-react'
import { useProjectsStore } from '../../store/projectsStore'
import { useNavigate } from 'react-router-dom'
import { BUILTIN_TEMPLATES, buildBuiltinTemplate } from '../../constants/templateGallery'

const SIZE_PRESETS = [
  { label: 'A4 Portrait', width: 794, height: 1123 },
  { label: 'A4 Landscape', width: 1123, height: 794 },
  { label: 'Letter', width: 816, height: 1056 },
  { label: 'Full HD', width: 1920, height: 1080 },
  { label: 'Square', width: 1080, height: 1080 },
  { label: 'Story', width: 1080, height: 1920 },
]

const TEMPLATE_ICONS: Record<string, React.ReactNode> = {
  invoice: <FileText size={18} />,
  certificate: <Award size={18} />,
  card: <IdCard size={18} />,
  social: <Sparkles size={18} />,
}

interface Props {
  onClose: () => void
}

type Tab = 'blank' | 'templates'

export default function CreateProjectModal({ onClose }: Props) {
  const navigate = useNavigate()
  const createProject = useProjectsStore((s) => s.createProject)
  const upsertTemplate = useProjectsStore((s) => s.upsertTemplate)
  const [tab, setTab] = useState<Tab>('templates')
  const [name, setName] = useState('')
  const [presetIdx, setPresetIdx] = useState(3)

  function startBlank(e: React.FormEvent) {
    e.preventDefault()
    const preset = SIZE_PRESETS[presetIdx]!
    const project = createProject(name || 'Untitled Project', { width: preset.width, height: preset.height })
    onClose()
    navigate(`/project/${project.id}`)
  }

  function startFromTemplate(templateId: string) {
    const built = buildBuiltinTemplate(templateId)
    if (!built) return
    const tpl = BUILTIN_TEMPLATES.find((t) => t.id === templateId)!
    const projectName = name.trim() || tpl.name
    const project = createProject(projectName, { width: built.canvasWidth, height: built.canvasHeight })
    upsertTemplate(project.id, {
      ...project.template,
      ...built,
      name: projectName,
    })
    onClose()
    navigate(`/project/${project.id}`)
  }

  return (
    <div
      className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto scroll-thin"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 tracking-tight">Create new project</h2>
            <p className="text-xs text-gray-500 mt-0.5">Start from a template or a blank canvas.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Project name</label>
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My new design"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
          />
        </div>

        <div className="flex p-0.5 bg-gray-100 rounded-lg">
          <button
            onClick={() => setTab('templates')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
              tab === 'templates' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            Templates
          </button>
          <button
            onClick={() => setTab('blank')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
              tab === 'blank' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            Blank canvas
          </button>
        </div>

        {tab === 'templates' ? (
          <div>
            <div className="grid grid-cols-2 gap-3">
              {BUILTIN_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => startFromTemplate(tpl.id)}
                  className="text-left bg-white border border-gray-200 hover:border-violet-400 hover:shadow-md rounded-xl overflow-hidden transition-all"
                >
                  <div
                    className="bg-gradient-to-br from-violet-50 to-fuchsia-50 px-4 py-6 flex items-center justify-center text-violet-600"
                    style={{ aspectRatio: tpl.width / tpl.height, minHeight: 80 }}
                  >
                    {TEMPLATE_ICONS[tpl.category] ?? <Square size={18} />}
                  </div>
                  <div className="px-3 py-2">
                    <div className="text-sm font-semibold text-gray-900">{tpl.name}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      {tpl.width}×{tpl.height}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <form onSubmit={startBlank} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Canvas size</label>
              <div className="grid grid-cols-3 gap-2">
                {SIZE_PRESETS.map((p, i) => {
                  const active = i === presetIdx
                  const aspect = p.width / p.height
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setPresetIdx(i)}
                      className={`text-left p-3 rounded-lg border-2 transition-all ${
                        active
                          ? 'border-violet-500 bg-violet-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div
                        className={`mx-auto mb-2 rounded-sm ${
                          active ? 'bg-violet-500' : 'bg-gray-300'
                        }`}
                        style={{
                          width: aspect >= 1 ? 36 : 36 * aspect,
                          height: aspect >= 1 ? 36 / aspect : 36,
                        }}
                      />
                      <div className={`text-sm font-medium ${active ? 'text-violet-700' : 'text-gray-800'}`}>
                        {p.label}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        {p.width}×{p.height}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
              >
                Create project
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
