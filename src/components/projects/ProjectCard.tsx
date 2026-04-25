import { useEffect, useRef, useState } from 'react'
import { MoreVertical, Copy, Trash2, Pencil } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Project } from '../../types'
import { useProjectsStore } from '../../store/projectsStore'
import TemplatePreview from './TemplatePreview'

interface Props {
  project: Project
}

function formatDate(ts: number): string {
  const diff = Date.now() - ts
  const day = 24 * 60 * 60 * 1000
  if (diff < day) return 'today'
  if (diff < 2 * day) return 'yesterday'
  if (diff < 7 * day) return `${Math.floor(diff / day)} days ago`
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
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

  return (
    <div className="group relative">
      <button
        onClick={open}
        className="block w-full bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg overflow-hidden transition-all"
        aria-label={`Open ${project.name}`}
      >
        <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-4">
          <TemplatePreview
            template={project.template}
            className="rounded-md shadow-sm bg-white ring-1 ring-black/5"
          />
          {project.template.elements.length === 0 && (
            <div className="absolute inset-4 flex items-center justify-center pointer-events-none">
              <span className="text-[10px] uppercase tracking-wider text-gray-300">Empty</span>
            </div>
          )}
        </div>
      </button>

      <div className="px-1 pt-3 pb-1 flex items-start justify-between gap-2">
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
              className="w-full text-sm font-medium border border-violet-400 rounded px-1.5 py-0.5 focus:outline-none"
            />
          ) : (
            <button
              onClick={open}
              className="text-sm font-semibold text-gray-900 truncate hover:text-violet-700 text-left w-full leading-tight"
            >
              {project.name}
            </button>
          )}
          <div className="text-xs text-gray-500 mt-0.5">
            {project.template.canvasWidth}×{project.template.canvasHeight} · {formatDate(project.updatedAt)}
          </div>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setMenuOpen((v) => !v)
            }}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
            aria-label="Project menu"
          >
            <MoreVertical size={16} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-10">
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
              <div className="border-t border-gray-100 my-1" />
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
