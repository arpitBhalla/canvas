import { useMemo, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { useProjectsStore } from '../store/projectsStore'
import ProjectCard from '../components/projects/ProjectCard'
import CreateProjectModal from '../components/projects/CreateProjectModal'

export default function Home() {
  const projects = useProjectsStore((s) => s.projects)
  const [creating, setCreating] = useState(false)
  const [query, setQuery] = useState('')

  const sorted = useMemo(() => [...projects].sort((a, b) => b.updatedAt - a.updatedAt), [projects])
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return sorted
    return sorted.filter((p) => p.name.toLowerCase().includes(q))
  }, [sorted, query])

  return (
    <div className="min-h-full bg-gradient-to-b from-violet-50/40 via-white to-white">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-gray-200/70">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="Canvas Studio" width={32} height={32} className="rounded-lg shadow-sm" />
            <span className="font-semibold text-gray-900 tracking-tight">Canvas Studio</span>
          </div>

          <div className="flex-1 max-w-md relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects"
              className="w-full pl-9 pr-3 py-2 text-sm bg-gray-100 border border-transparent rounded-lg focus:outline-none focus:bg-white focus:border-gray-300 transition-colors"
            />
          </div>

          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">New project</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Your projects</h1>
          <p className="text-sm text-gray-500 mt-1">
            {projects.length === 0
              ? 'Create your first project to get started.'
              : `${projects.length} ${projects.length === 1 ? 'project' : 'projects'}${query ? ` · ${filtered.length} match` : ''}`}
          </p>
        </div>

        {projects.length === 0 ? (
          <button
            onClick={() => setCreating(true)}
            className="w-full max-w-md mx-auto block bg-white border-2 border-dashed border-gray-300 rounded-2xl py-20 px-6 hover:border-violet-400 hover:bg-violet-50/40 transition-all group"
          >
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-violet-100 group-hover:bg-violet-200 flex items-center justify-center transition-colors">
              <Plus size={24} className="text-violet-600" />
            </div>
            <div className="text-base font-medium text-gray-800">Create a project</div>
            <div className="text-sm text-gray-500 mt-1">Start with a blank canvas</div>
          </button>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-7">
            <button
              onClick={() => setCreating(true)}
              className="bg-white border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center hover:border-violet-400 hover:bg-violet-50/40 transition-all group min-h-[220px]"
            >
              <div className="w-10 h-10 mb-2 rounded-full bg-gray-100 group-hover:bg-violet-100 flex items-center justify-center transition-colors">
                <Plus size={20} className="text-gray-500 group-hover:text-violet-600" />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-violet-700">
                New project
              </span>
            </button>
            {filtered.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
            {filtered.length === 0 && query && (
              <div className="col-span-full text-center py-12 text-sm text-gray-500">
                No projects match "{query}"
              </div>
            )}
          </div>
        )}
      </main>

      {creating && <CreateProjectModal onClose={() => setCreating(false)} />}
    </div>
  )
}
