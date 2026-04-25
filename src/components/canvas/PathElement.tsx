import type { PathElement as PathElementType } from '../../types'
import { pointsToD } from '../../utils/path'
import { shadowToCss } from '../../utils/style'

interface Props {
  element: PathElementType
}

export default function PathElement({ element }: Props) {
  const d = pointsToD(element.points, element.mode, element.closed)
  const shadow = shadowToCss(element.shadow)
  const markerId = `path-arrow-${element.id}`
  const showArrow = element.arrowhead && element.arrowhead !== 'none'

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${element.size.width} ${element.size.height}`}
      preserveAspectRatio="none"
      style={{ overflow: 'visible', filter: shadow ? `drop-shadow(${shadow})` : undefined }}
    >
      {showArrow && (
        <defs>
          <marker
            id={markerId}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerUnits="strokeWidth"
            markerWidth="4"
            markerHeight="4"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={element.stroke} />
          </marker>
        </defs>
      )}
      <path
        d={d}
        fill={element.closed ? element.stroke : 'none'}
        fillOpacity={element.closed ? 0.1 : 0}
        stroke={element.stroke}
        strokeWidth={element.strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        markerEnd={showArrow && (element.arrowhead === 'end' || element.arrowhead === 'both') ? `url(#${markerId})` : undefined}
        markerStart={showArrow && element.arrowhead === 'both' ? `url(#${markerId})` : undefined}
      />
    </svg>
  )
}
