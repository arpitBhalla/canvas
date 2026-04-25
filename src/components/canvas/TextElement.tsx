import { useRef, useCallback, useEffect } from 'react'
import { useEditorStore } from '../../store/editorStore'
import type { TextElement as TextElementType } from '../../types'
import { parseContentToSegments } from '../../utils/variables'
import { shadowToCss } from '../../utils/style'

interface Props {
  element: TextElementType
}

export default function TextElement({ element }: Props) {
  const editingTextId = useEditorStore((s) => s.editingTextId)
  const setEditingText = useEditorStore((s) => s.setEditingText)
  const updateElement = useEditorStore((s) => s.updateElement)

  const isEditing = editingTextId === element.id
  const contentRef = useRef<HTMLDivElement>(null)

  const syncContent = useCallback(() => {
    if (!contentRef.current) return
    const nodes = contentRef.current.childNodes
    let raw = ''
    nodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        raw += node.textContent ?? ''
      } else if (node instanceof HTMLElement) {
        const varName = node.dataset.variable
        if (varName) {
          raw += `{{${varName}}}`
        } else {
          raw += node.textContent ?? ''
        }
      }
    })
    if (raw !== element.content) {
      updateElement(element.id, { content: raw })
    }
  }, [element.id, element.content, updateElement])

  useEffect(() => {
    if (isEditing && contentRef.current) {
      contentRef.current.focus()
    }
  }, [isEditing])

  const segments = parseContentToSegments(element.content)

  const style: React.CSSProperties = {
    width: '100%',
    height: '100%',
    fontSize: element.fontSize,
    fontFamily: element.fontFamily,
    fontWeight: element.fontWeight,
    fontStyle: element.fontStyle,
    textDecoration: element.textDecoration,
    textAlign: element.textAlign,
    color: element.color,
    backgroundColor: element.backgroundColor,
    lineHeight: element.lineHeight,
    letterSpacing: element.letterSpacing != null ? `${element.letterSpacing}px` : undefined,
    padding: element.padding,
    textShadow: shadowToCss(element.shadow),
    outline: 'none',
    overflow: 'hidden',
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',
  }

  if (isEditing) {
    return (
      <div
        ref={contentRef}
        contentEditable
        suppressContentEditableWarning
        style={style}
        onBlur={syncContent}
        onDoubleClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {segments.map((seg, i) =>
          seg.type === 'variable' ? (
            <span
              key={i}
              data-variable={seg.value}
              contentEditable={false}
              className="inline-block bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded text-sm font-medium mx-0.5 select-none"
            >
              {`{{${seg.value}}}`}
            </span>
          ) : (
            <span key={i}>{seg.value}</span>
          )
        )}
      </div>
    )
  }

  return (
    <div
      style={style}
      onDoubleClick={(e) => {
        e.stopPropagation()
        setEditingText(element.id)
      }}
    >
      {segments.map((seg, i) =>
        seg.type === 'variable' ? (
          <span
            key={i}
            className="inline-block bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded text-sm font-medium mx-0.5"
          >
            {seg.value}
          </span>
        ) : (
          <span key={i}>{seg.value}</span>
        )
      )}
    </div>
  )
}
