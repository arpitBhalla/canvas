import { Settings2, Type, Square, Image as ImageIcon } from 'lucide-react'
import { useEditorStore } from '../../store/editorStore'
import TextProperties from '../properties/TextProperties'
import ShapeProperties from '../properties/ShapeProperties'
import ImageProperties from '../properties/ImageProperties'
import ElementActions from '../properties/ElementActions'
import CanvasProperties from '../properties/CanvasProperties'

const ICONS = {
  text: Type,
  shape: Square,
  image: ImageIcon,
} as const

export default function RightSidebar() {
  const selectedElementId = useEditorStore((s) => s.selectedElementId)
  const elements = useEditorStore((s) => s.template.elements)

  const element = selectedElementId ? elements.find((e) => e.id === selectedElementId) : null
  const Icon = element ? ICONS[element.type] : Settings2

  return (
    <div className="w-64 bg-white border-l border-gray-200 flex flex-col shrink-0 overflow-y-auto scroll-thin">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2">
        <Icon size={14} className="text-gray-500" />
        <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
          {element ? `${element.type} properties` : 'Canvas'}
        </h3>
      </div>
      {element ? (
        <div className="p-4 space-y-4">
          {element.type === 'text' && <TextProperties element={element} />}
          {element.type === 'shape' && <ShapeProperties element={element} />}
          {element.type === 'image' && <ImageProperties element={element} />}
          <div className="pt-3 border-t border-gray-100">
            <ElementActions element={element} />
          </div>
        </div>
      ) : (
        <div className="p-4">
          <CanvasProperties />
        </div>
      )}
    </div>
  )
}
