import { useEffect, useRef, useState } from 'react'
import { MoreVertical, Copy, Trash2, Pencil } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Project } from '../../types'
import { useProjectsStore } from '../../store/projectsStore'

interface Props {
  project: Project
}

function formatDate(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function ProjectCard({ project }: Props) {
  const navigate = useNavigate()
  const renameProject = useProjectsStore((s) => s.renameProject)
  const deleteProject = useProjectsStore((s) => s.deleteProject)
  const duplicateProject = useProjectsStore((s) => s.duplicateProject)

  const [menuOpen, setMenuOpen] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [name, setName] = useState(project.name)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    function onDoc(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [menuOpen])

  function open() {
    if (renaming) return
    navigate(`/project/${project.id}`)
  }

  function commitRename() {
    setRenaming(false)
    if (name.trim() && name.trim() !== project.name) renameProject(project.id, name.trim())
    else setName(project.name)
  }

  function handleDelete() {
    setMenuOpen(false)
    if (confirm(`Delete "${project.name}"? This cannot be undone.`)) {
      deleteProject(project.id)
    }
  }

  const aspect = project.template.canvasWidth / project.template.canvasHeight

  return (
    <div className="group bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all overflow-hidden">
      <button
        onClick={open}
        className="block w-full bg-gray-50 relative"
        style={{ aspectRatio: aspect }}
        aria-label={`Open ${project.name}`}
      >
        <div
          className="absolute inset-3 rounded shadow-sm"
          style={{ backgroundColor: project.template.backgroundColor }}
        />
        <div className="absolute bottom-2 right-2 text-[10px] text-gray-400 bg-white/80 rounded px-1.5 py-0.5">
          {project.template.elements.length} {project.template.elements.length === 1 ? 'element' : 'elements'}
        </div>
      </button>

      <div className="px-3 py-2 flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          {renaming ? (
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitRename()
                if (e.key === 'Escape') {
                  setName(project.name)
                  setRenaming(false)
                }
              }}
              className="w-full text-sm font-medium border border-violet-400 rounded px-1 py-0.5 focus:outline-none"
            />
          ) : (
            <button
              onClick={open}
              className="text-sm font-medium text-gray-900 truncate hover:text-violet-700 text-left w-full"
            >
              {project.name}
            </button>
          )}
          <div className="text-xs text-gray-400">Updated {formatDate(project.updatedAt)}</div>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setMenuOpen((v) => !v)
            }}
            className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Project menu"
          >
            <MoreVertical size={16} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded shadow-lg py-1 z-10">
              <button
                onClick={() => {
                  setMenuOpen(false)
                  setRenaming(true)
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Pencil size={14} /> Rename
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false)
                  duplicateProject(project.id)
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Copy size={14} /> Duplicate
              </button>
              <button
                onClick={handleDelete}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
