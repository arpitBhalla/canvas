import { create } from 'zustand'
import type { Project, Template } from '../types'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants/defaults'
import { createId } from '../utils/ids'

const STORAGE_KEY = 'canvas-projects-v1'
const LEGACY_KEY = 'canvas-template'
const SCHEMA_VERSION = 1

interface PersistedShape {
  version: number
  projects: Project[]
}

interface ProjectsState {
  projects: Project[]
  createProject: (name: string, size?: { width: number; height: number }) => Project
  renameProject: (id: string, name: string) => void
  deleteProject: (id: string) => void
  duplicateProject: (id: string) => Project | null
  getProject: (id: string) => Project | undefined
  upsertTemplate: (id: string, template: Template) => void
}

function makeBlankTemplate(name: string, size: { width: number; height: number }): Template {
  return {
    id: createId(),
    name,
    canvasWidth: size.width,
    canvasHeight: size.height,
    backgroundColor: '#ffffff',
    elements: [],
  }
}

function loadInitialProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as PersistedShape
      if (parsed && Array.isArray(parsed.projects)) return parsed.projects
    }
  } catch {
    // fall through to legacy migration
  }

  try {
    const legacy = localStorage.getItem(LEGACY_KEY)
    if (legacy) {
      const template = JSON.parse(legacy) as Template
      const now = Date.now()
      const migrated: Project = {
        id: createId(),
        name: template.name || 'Untitled Template',
        createdAt: now,
        updatedAt: now,
        template,
      }
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ version: SCHEMA_VERSION, projects: [migrated] } satisfies PersistedShape)
      )
      localStorage.removeItem(LEGACY_KEY)
      return [migrated]
    }
  } catch {
    // ignore corrupt data
  }

  return []
}

function persist(projects: Project[]) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: SCHEMA_VERSION, projects } satisfies PersistedShape)
    )
  } catch {
    // localStorage quota or disabled — silently drop
  }
}

export const useProjectsStore = create<ProjectsState>()((set, get) => ({
  projects: loadInitialProjects(),

  createProject: (name, size) => {
    const now = Date.now()
    const project: Project = {
      id: createId(),
      name: name.trim() || 'Untitled Project',
      createdAt: now,
      updatedAt: now,
      template: makeBlankTemplate(
        name.trim() || 'Untitled Project',
        size ?? { width: CANVAS_WIDTH, height: CANVAS_HEIGHT }
      ),
    }
    const next = [project, ...get().projects]
    persist(next)
    set({ projects: next })
    return project
  },

  renameProject: (id, name) => {
    const trimmed = name.trim() || 'Untitled Project'
    const next = get().projects.map((p) =>
      p.id === id
        ? { ...p, name: trimmed, template: { ...p.template, name: trimmed }, updatedAt: Date.now() }
        : p
    )
    persist(next)
    set({ projects: next })
  },

  deleteProject: (id) => {
    const next = get().projects.filter((p) => p.id !== id)
    persist(next)
    set({ projects: next })
  },

  duplicateProject: (id) => {
    const source = get().projects.find((p) => p.id === id)
    if (!source) return null
    const now = Date.now()
    const copy: Project = {
      id: createId(),
      name: `${source.name} (copy)`,
      createdAt: now,
      updatedAt: now,
      template: {
        ...source.template,
        id: createId(),
        name: `${source.name} (copy)`,
        elements: source.template.elements.map((el) => ({ ...el })),
      },
    }
    const next = [copy, ...get().projects]
    persist(next)
    set({ projects: next })
    return copy
  },

  getProject: (id) => get().projects.find((p) => p.id === id),

  upsertTemplate: (id, template) => {
    const existing = get().projects.find((p) => p.id === id)
    if (!existing) return
    const next = get().projects.map((p) =>
      p.id === id
        ? { ...p, name: template.name, template, updatedAt: Date.now() }
        : p
    )
    persist(next)
    set({ projects: next })
  },
}))
