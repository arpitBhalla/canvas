import { useEffect } from 'react'
import { useEditorStore } from '../store/editorStore'

export function useCanvasKeyboard() {
  const deleteElement = useEditorStore((s) => s.deleteElement)
  const duplicateElement = useEditorStore((s) => s.duplicateElement)
  const moveElement = useEditorStore((s) => s.moveElement)
  const selectElement = useEditorStore((s) => s.selectElement)
  const togglePreview = useEditorStore((s) => s.togglePreview)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const state = useEditorStore.getState()
      const { selectedElementId, editingTextId, previewOpen } = state

      // Don't capture keys when editing text
      if (editingTextId) return

      if (e.key === 'Escape') {
        if (previewOpen) {
          togglePreview()
        } else {
          selectElement(null)
        }
        return
      }

      if (!selectedElementId) return

      const el = state.template.elements.find((e) => e.id === selectedElementId)
      if (!el) return

      const mod = e.metaKey || e.ctrlKey

      if ((e.key === 'Delete' || e.key === 'Backspace') && !mod) {
        e.preventDefault()
        deleteElement(selectedElementId)
        return
      }

      if (e.key === 'd' && mod) {
        e.preventDefault()
        duplicateElement(selectedElementId)
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

      const nudge = e.shiftKey ? 10 : 1
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        moveElement(selectedElementId, { x: el.position.x, y: el.position.y - nudge })
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        moveElement(selectedElementId, { x: el.position.x, y: el.position.y + nudge })
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        moveElement(selectedElementId, { x: el.position.x - nudge, y: el.position.y })
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        moveElement(selectedElementId, { x: el.position.x + nudge, y: el.position.y })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [deleteElement, duplicateElement, moveElement, selectElement, togglePreview])
}
