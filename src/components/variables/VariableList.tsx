import { useEditorStore } from '../../store/editorStore'
import type { TextElement } from '../../types'

export default function VariableList() {
  const selectedElementId = useEditorStore((s) => s.selectedElementId)
  const editingTextId = useEditorStore((s) => s.editingTextId)
  const elements = useEditorStore((s) => s.template.elements)
  const updateElement = useEditorStore((s) => s.updateElement)
  const dataSource = useEditorStore((s) => s.dataSource)

  const selectedElement = elements.find((e) => e.id === selectedElementId)
  const isTextSelected = selectedElement?.type === 'text'

  const variables = dataSource?.headers ?? []

  function insertVariable(variableName: string) {
    const targetId = editingTextId ?? selectedElementId
    if (!targetId) return

    const el = elements.find((e) => e.id === targetId)
    if (!el || el.type !== 'text') return

    const textEl = el as TextElement
    const placeholder = `{{${variableName}}}`

    const sel = window.getSelection()
    const contentDiv = document.querySelector(`[data-element-id="${targetId}"]`)

    if (sel && sel.rangeCount > 0 && contentDiv?.contains(sel.anchorNode)) {
      document.execCommand('insertText', false, placeholder)
    } else {
      updateElement(targetId, { content: textEl.content + placeholder })
    }
  }

  if (variables.length === 0) {
    return (
      <div className="p-3">
        <p className="text-xs text-gray-500">
          Upload a CSV or paste JSON in the <span className="font-medium">Data</span> tab first.
          Variable names will be extracted from the column headers automatically.
        </p>
      </div>
    )
  }

  return (
    <div className="p-3 space-y-3">
      <p className="text-xs text-gray-500">
        {isTextSelected
          ? 'Click a variable to insert it into the selected text.'
          : 'Select a text element first, then click to insert.'}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {variables.map((name) => (
          <button
            key={name}
            onClick={() => insertVariable(name)}
            disabled={!isTextSelected}
            className="inline-flex items-center px-2.5 py-1 bg-violet-50 text-violet-700 text-sm rounded-full hover:bg-violet-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-violet-200"
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  )
}
