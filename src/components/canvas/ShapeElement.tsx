import type { ShapeElement as ShapeElementType } from '../../types'
import { shadowToCss, shapeFillCss } from '../../utils/style'

interface Props {
  element: ShapeElementType
}

const STAR_PATH = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
const TRIANGLE_PATH = 'polygon(50% 0%, 0% 100%, 100% 100%)'

export default function ShapeElement({ element }: Props) {
  const fillStyle = shapeFillCss(element)
  const shadow = shadowToCss(element.shadow)

  if (element.shape === 'line' || element.shape === 'arrow') {
    const stroke = element.stroke && element.stroke !== 'transparent' ? element.stroke : element.fill
    const sw = Math.max(1, element.strokeWidth || 2)
    const w = element.size.width
    const h = element.size.height
    const markerId = `arrow-${element.id}`

    return (
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        style={{ overflow: 'visible', filter: shadow ? `drop-shadow(${shadow})` : undefined }}
      >
        {element.shape === 'arrow' && (
          <defs>
            <marker
              id={markerId}
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerUnits="strokeWidth"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill={stroke} />
            </marker>
          </defs>
        )}
        <line
          x1={sw / 2}
          y1={h / 2}
          x2={w - sw / 2}
          y2={h / 2}
          stroke={stroke}
          strokeWidth={sw}
          strokeLinecap="round"
          markerEnd={element.shape === 'arrow' ? `url(#${markerId})` : undefined}
        />
      </svg>
    )
  }

  let clipPath: string | undefined
  let borderRadius: number | string | undefined = element.borderRadius
  if (element.shape === 'circle') borderRadius = '50%'
  else if (element.shape === 'triangle') {
    clipPath = TRIANGLE_PATH
    borderRadius = 0
  } else if (element.shape === 'star') {
    clipPath = STAR_PATH
    borderRadius = 0
  }

  const usesClip = !!clipPath
  const style: React.CSSProperties = {
    width: '100%',
    height: '100%',
    ...fillStyle,
    border: !usesClip && element.strokeWidth > 0 ? `${element.strokeWidth}px solid ${element.stroke}` : 'none',
    borderRadius,
    clipPath,
    boxShadow: !usesClip ? shadow : undefined,
    filter: usesClip && shadow ? `drop-shadow(${shadow})` : undefined,
  }

  return <div style={style} />
}
