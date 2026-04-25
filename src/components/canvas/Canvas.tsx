import { useRef } from 'react'
import { useEditorStore } from '../../store/editorStore'
import { useCanvasDropZone } from '../../hooks/useCanvasDropZone'
import CanvasElement from './CanvasElement'

export default function Canvas() {
  const template = useEditorStore((s) => s.template)
  const zoom = useEditorStore((s) => s.zoom)
  const selectElement = useEditorStore((s) => s.selectElement)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const isDragging = useCanvasDropZone(wrapperRef)

  const sorted = [...template.elements].sort((a, b) => a.zIndex - b.zIndex)

  return (
    <div
      ref={wrapperRef}
      className={`relative flex-1 overflow-auto flex items-center justify-center bg-gray-200 transition-shadow ${
        isDragging ? 'ring-4 ring-violet-400 ring-inset' : ''
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.canvasBg) {
          selectElement(null)
        }
      }}
    >
      <div
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
        }}
      >
        <div
          data-canvas-bg="true"
          className="relative shadow-xl"
          style={{
            width: template.canvasWidth,
            height: template.canvasHeight,
            backgroundColor: template.backgroundColor,
          }}
        >
          {sorted.map((el) => (
            <CanvasElement key={el.id} element={el} />
          ))}
        </div>
      </div>
      {isDragging && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="bg-violet-600 text-white text-sm font-medium px-4 py-2 rounded-full shadow-lg">
            Drop image to add
          </div>
        </div>
      )}
    </div>
  )
}
