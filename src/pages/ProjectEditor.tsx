import { useEffect, useRef } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import Header from '../components/layout/Header'
import LeftSidebar from '../components/layout/LeftSidebar'
import RightSidebar from '../components/layout/RightSidebar'
import Canvas from '../components/canvas/Canvas'
import PreviewModal from '../components/preview/PreviewModal'
import { useEditorStore } from '../store/editorStore'
import { useProjectsStore } from '../store/projectsStore'
import { useCanvasKeyboard } from '../hooks/useCanvasKeyboard'
import { loadFontsForTemplate } from '../utils/fonts'

const SAVE_DEBOUNCE_MS = 500

export default function ProjectEditor() {
  const { id } = useParams<{ id: string }>()
  const project = useProjectsStore((s) => (id ? s.projects.find((p) => p.id === id) : undefined))
  const upsertTemplate = useProjectsStore((s) => s.upsertTemplate)
  const previewOpen = useEditorStore((s) => s.previewOpen)
  const loadProject = useEditorStore((s) => s.loadProject)
  const hydratedFor = useRef<string | null>(null)

  useCanvasKeyboard()

  useEffect(() => {
    if (!project || hydratedFor.current === project.id) return
    loadProject(project.template)
    loadFontsForTemplate(project.template)
    hydratedFor.current = project.id
  }, [project, loadProject])

  useEffect(() => {
    if (!id) return
    let timer: ReturnType<typeof setTimeout> | null = null
    const unsubscribe = useEditorStore.subscribe((state, prev) => {
      if (state.template === prev.template) return
      if (hydratedFor.current !== id) return
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        upsertTemplate(id, useEditorStore.getState().template)
      }, SAVE_DEBOUNCE_MS)
    })
    return () => {
      if (timer) clearTimeout(timer)
      unsubscribe()
    }
  }, [id, upsertTemplate])

  if (!id) return <Navigate to="/" replace />
  if (!project) return <Navigate to="/" replace />

  return (
    <div className="h-full w-full flex flex-col bg-gray-100">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar />
        <Canvas />
        <RightSidebar />
      </div>
      {previewOpen && <PreviewModal />}
    </div>
  )
}
