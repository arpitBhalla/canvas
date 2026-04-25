import { Settings2, Type, Square, Image as ImageIcon, Layers, PenTool, QrCode } from 'lucide-react'
import { useEditorStore } from '../../store/editorStore'
import TextProperties from '../properties/TextProperties'
import ShapeProperties from '../properties/ShapeProperties'
import ImageProperties from '../properties/ImageProperties'
import PathProperties from '../properties/PathProperties'
import QrProperties from '../properties/QrProperties'
import ElementActions from '../properties/ElementActions'
import CanvasProperties from '../properties/CanvasProperties'
import VisibilityField from '../properties/VisibilityField'
import ShadowField from '../properties/ShadowField'
import AlignmentToolbar from '../properties/AlignmentToolbar'

const ICONS = {
  text: Type,
  shape: Square,
  image: ImageIcon,
  path: PenTool,
  qr: QrCode,
} as const

export default function RightSidebar() {
  const selectedElementIds = useEditorStore((s) => s.selectedElementIds)
  const elements = useEditorStore((s) => s.template.elements)

  const element =
    selectedElementIds.length === 1
      ? elements.find((e) => e.id === selectedElementIds[0]) ?? null
      : null
  const multiSelectCount = selectedElementIds.length > 1 ? selectedElementIds.length : 0
  const Icon = element ? ICONS[element.type] : multiSelectCount > 0 ? Layers : Settings2

  return (
    <div className="w-64 bg-white border-l border-gray-200 flex flex-col shrink-0 overflow-y-auto scroll-thin">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2">
        <Icon size={14} className="text-gray-500" />
        <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
          {element
            ? `${element.type} properties`
            : multiSelectCount > 0
            ? `${multiSelectCount} selected`
            : 'Canvas'}
        </h3>
      </div>
      {element ? (
        <div className="p-4 space-y-4">
          {element.type === 'text' && <TextProperties element={element} />}
          {element.type === 'shape' && <ShapeProperties element={element} />}
          {element.type === 'image' && <ImageProperties element={element} />}
          {element.type === 'path' && <PathProperties element={element} />}
          {element.type === 'qr' && <QrProperties element={element} />}
          {element.type !== 'path' && (
            <div className="pt-3 border-t border-gray-100">
              <ShadowField element={element} />
            </div>
          )}
          <VisibilityField element={element} />
          <div className="pt-3 border-t border-gray-100">
            <ElementActions element={element} />
          </div>
        </div>
      ) : multiSelectCount > 0 ? (
        <div className="p-4">
          <AlignmentToolbar />
        </div>
      ) : (
        <div className="p-4">
          <CanvasProperties />
        </div>
      )}
    </div>
  )
}
