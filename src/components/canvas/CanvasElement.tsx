import { Rnd } from 'react-rnd'
import { useEditorStore } from '../../store/editorStore'
import type { CanvasElement as CanvasElementType } from '../../types'
import TextElement from './TextElement'
import ShapeElement from './ShapeElement'
import ImageElement from './ImageElement'

interface Props {
  element: CanvasElementType
}

export default function CanvasElement({ element }: Props) {
  const selectedElementId = useEditorStore((s) => s.selectedElementId)
  const editingTextId = useEditorStore((s) => s.editingTextId)
  const selectElement = useEditorStore((s) => s.selectElement)
  const moveElement = useEditorStore((s) => s.moveElement)
  const resizeElement = useEditorStore((s) => s.resizeElement)

  const isSelected = selectedElementId === element.id
  const isEditingThis = editingTextId === element.id

  function renderElement() {
    switch (element.type) {
      case 'text':
        return <TextElement element={element} />
      case 'shape':
        return <ShapeElement element={element} />
      case 'image':
        return <ImageElement element={element} />
    }
  }

  return (
    <Rnd
      position={{ x: element.position.x, y: element.position.y }}
      size={{ width: element.size.width, height: element.size.height }}
      onDragStop={(_e, d) => {
        moveElement(element.id, { x: d.x, y: d.y })
      }}
      onResizeStop={(_e, _dir, ref, _delta, position) => {
        resizeElement(
          element.id,
          { width: parseInt(ref.style.width), height: parseInt(ref.style.height) },
          position
        )
      }}
      bounds="parent"
      disableDragging={element.locked || isEditingThis}
      enableResizing={!element.locked}
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation()
        if (!isSelected) {
          selectElement(element.id)
        }
      }}
      style={{
        zIndex: element.zIndex,
        opacity: element.opacity,
        outline: isSelected ? '2px solid #3b82f6' : 'none',
        outlineOffset: '1px',
        cursor: isEditingThis ? 'text' : 'move',
      }}
    >
      {renderElement()}
    </Rnd>
  )
}
