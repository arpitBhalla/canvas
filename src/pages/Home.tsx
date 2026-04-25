import { useState } from 'react'
import { Plus, Sparkles } from 'lucide-react'
import { useProjectsStore } from '../store/projectsStore'
import ProjectCard from '../components/projects/ProjectCard'
import CreateProjectModal from '../components/projects/CreateProjectModal'

export default function Home() {
  const projects = useProjectsStore((s) => s.projects)
  const [creating, setCreating] = useState(false)

  const sorted = [...projects].sort((a, b) => b.updatedAt - a.updatedAt)

  return (
    <div className="min-h-full bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-violet-600" />
            <span className="font-semibold text-gray-900">Canvas Studio</span>
          </div>
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm bg-violet-600 text-white rounded hover:bg-violet-700 transition-colors"
          >
            <Plus size={16} />
            New project
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Your projects</h1>
        <p className="text-sm text-gray-500 mb-6">
          {projects.length === 0
            ? 'Create your first project to get started.'
            : `${projects.length} ${projects.length === 1 ? 'project' : 'projects'}`}
        </p>

        {projects.length === 0 ? (
          <button
            onClick={() => setCreating(true)}
            className="w-full max-w-md mx-auto block bg-white border-2 border-dashed border-gray-300 rounded-lg py-16 px-6 hover:border-violet-400 hover:bg-violet-50/30 transition-colors group"
          >
            <Plus size={32} className="text-gray-400 group-hover:text-violet-500 mx-auto mb-2" />
            <div className="text-sm font-medium text-gray-700">Create a project</div>
            <div className="text-xs text-gray-400 mt-1">Start with a blank canvas</div>
          </button>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <button
              onClick={() => setCreating(true)}
              className="bg-white border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-violet-400 hover:bg-violet-50/30 transition-colors group min-h-[200px]"
            >
              <Plus size={28} className="text-gray-400 group-hover:text-violet-500 mb-1" />
              <span className="text-sm font-medium text-gray-600 group-hover:text-violet-700">
                New project
              </span>
            </button>
            {sorted.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </main>

      {creating && <CreateProjectModal onClose={() => setCreating(false)} />}
    </div>
  )
}
