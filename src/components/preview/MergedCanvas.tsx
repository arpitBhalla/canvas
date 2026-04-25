import { useEditorStore } from '../../store/editorStore'
import { replaceVariables } from '../../utils/variables'
import type { TextElement, ShapeElement, ImageElement } from '../../types'

interface Props {
  data: Record<string, string>
}

export default function MergedCanvas({ data }: Props) {
  const template = useEditorStore((s) => s.template)

  const sorted = [...template.elements].sort((a, b) => a.zIndex - b.zIndex)

  return (
    <div
      className="relative shadow-xl"
      style={{
        width: template.canvasWidth,
        height: template.canvasHeight,
        backgroundColor: template.backgroundColor,
      }}
    >
      {sorted.map((el) => {
        const baseStyle: React.CSSProperties = {
          position: 'absolute',
          left: el.position.x,
          top: el.position.y,
          width: el.size.width,
          height: el.size.height,
          zIndex: el.zIndex,
          opacity: el.opacity,
        }

        if (el.type === 'text') {
          const t = el as TextElement
          return (
            <div
              key={el.id}
              style={{
                ...baseStyle,
                fontSize: t.fontSize,
                fontFamily: t.fontFamily,
                fontWeight: t.fontWeight,
                fontStyle: t.fontStyle,
                textDecoration: t.textDecoration,
                textAlign: t.textAlign,
                color: t.color,
                backgroundColor: t.backgroundColor,
                lineHeight: t.lineHeight,
                padding: t.padding,
                overflow: 'hidden',
                wordBreak: 'break-word',
                whiteSpace: 'pre-wrap',
              }}
            >
              {replaceVariables(t.content, data)}
            </div>
          )
        }

        if (el.type === 'shape') {
          const s = el as ShapeElement
          return (
            <div
              key={el.id}
              style={{
                ...baseStyle,
                backgroundColor: s.fill,
                border: s.strokeWidth > 0 ? `${s.strokeWidth}px solid ${s.stroke}` : 'none',
                borderRadius: s.shape === 'circle' ? '50%' : s.borderRadius,
              }}
            />
          )
        }

        if (el.type === 'image') {
          const img = el as ImageElement
          return img.src ? (
            <img
              key={el.id}
              src={img.src}
              alt=""
              style={{
                ...baseStyle,
                objectFit: img.objectFit,
                borderRadius: img.borderRadius,
              }}
            />
          ) : (
            <div
              key={el.id}
              style={baseStyle}
              className="flex items-center justify-center bg-gray-100 text-gray-400 text-sm border-2 border-dashed border-gray-300"
            >
              No image
            </div>
          )
        }

        return null
      })}
    </div>
  )
}
