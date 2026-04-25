import { useEditorStore } from '../../store/editorStore'
import TextProperties from '../properties/TextProperties'
import ShapeProperties from '../properties/ShapeProperties'
import ImageProperties from '../properties/ImageProperties'
import ElementActions from '../properties/ElementActions'
import CanvasProperties from '../properties/CanvasProperties'

export default function RightSidebar() {
  const selectedElementId = useEditorStore((s) => s.selectedElementId)
  const elements = useEditorStore((s) => s.template.elements)

  const element = selectedElementId ? elements.find((e) => e.id === selectedElementId) : null

  return (
    <div className="w-64 bg-white border-l border-gray-200 flex flex-col shrink-0 overflow-y-auto">
      {element ? (
        <>
          <div className="p-3 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 capitalize">
              {element.type} Properties
            </h3>
          </div>
          <div className="p-3 space-y-4">
            {element.type === 'text' && <TextProperties element={element} />}
            {element.type === 'shape' && <ShapeProperties element={element} />}
            {element.type === 'image' && <ImageProperties element={element} />}
            <ElementActions element={element} />
          </div>
        </>
      ) : (
        <>
          <div className="p-3 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-700">Canvas</h3>
          </div>
          <div className="p-3">
            <CanvasProperties />
          </div>
        </>
      )}
    </div>
  )
}
