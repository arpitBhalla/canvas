import { useEffect } from 'react'
import { useEditorStore } from '../store/editorStore'

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  return target.isContentEditable
}

export function useCanvasKeyboard() {
  const deleteSelected = useEditorStore((s) => s.deleteSelected)
  const duplicateSelected = useEditorStore((s) => s.duplicateSelected)
  const moveSelectedBy = useEditorStore((s) => s.moveSelectedBy)
  const clearSelection = useEditorStore((s) => s.clearSelection)
  const selectMany = useEditorStore((s) => s.selectMany)
  const togglePreview = useEditorStore((s) => s.togglePreview)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (isEditableTarget(e.target)) return

      const state = useEditorStore.getState()
      const { selectedElementIds, editingTextId, previewOpen } = state

      if (editingTextId) return

      const mod = e.metaKey || e.ctrlKey

      if (e.key === 'Escape') {
        if (previewOpen) togglePreview()
        else clearSelection()
        return
      }

      if (e.key === 'a' && mod) {
        e.preventDefault()
        const ids = state.template.elements.map((el) => el.id)
        selectMany(ids)
        return
      }

      if (e.key === 'g' && mod) {
        e.preventDefault()
        if (e.shiftKey) state.ungroupSelected()
        else state.groupSelected()
        return
      }

      if (e.key === 'z' && mod && !e.shiftKey) {
        e.preventDefault()
        useEditorStore.temporal.getState().undo()
        return
      }

      if (e.key === 'z' && mod && e.shiftKey) {
        e.preventDefault()
        useEditorStore.temporal.getState().redo()
        return
      }

      if (selectedElementIds.length === 0) return

      if ((e.key === 'Delete' || e.key === 'Backspace') && !mod) {
        e.preventDefault()
        deleteSelected()
        return
      }

      if (e.key === 'd' && mod) {
        e.preventDefault()
        duplicateSelected()
        return
      }

      const nudge = e.shiftKey ? 10 : 1
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        moveSelectedBy(0, -nudge)
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        moveSelectedBy(0, nudge)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        moveSelectedBy(-nudge, 0)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        moveSelectedBy(nudge, 0)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [deleteSelected, duplicateSelected, moveSelectedBy, clearSelection, selectMany, togglePreview])
}
