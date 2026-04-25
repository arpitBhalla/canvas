import { useMemo } from 'react'
import type { QrElement as QrElementType } from '../../types'
import { buildQr } from '../../utils/qr'
import { isVariableToken, variableTokenName } from '../../utils/variables'
import { shadowToCss } from '../../utils/style'

interface Props {
  element: QrElementType
  value?: string
}

export default function QrElement({ element, value }: Props) {
  const text = value ?? element.value
  const isUnresolvedVar = !value && isVariableToken(text)

  const parts = useMemo(() => {
    if (isUnresolvedVar) return null
    return buildQr(text, element.level)
  }, [text, element.level, isUnresolvedVar])

  const shadow = shadowToCss(element.shadow)

  if (isUnresolvedVar) {
    const name = variableTokenName(text)
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-violet-50 text-violet-700 text-xs font-medium border-2 border-dashed border-violet-300 rounded gap-0.5">
        <span className="opacity-70">QR variable</span>
        <span className="font-mono">{`{{${name}}}`}</span>
      </div>
    )
  }

  if (!parts) return null
  const total = parts.size + element.margin * 2

  let path = ''
  for (let row = 0; row < parts.size; row++) {
    for (let col = 0; col < parts.size; col++) {
      if (parts.modules[row]![col]) {
        path += `M${col + element.margin} ${row + element.margin}h1v1h-1z`
      }
    }
  }

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${total} ${total}`}
      preserveAspectRatio="xMidYMid meet"
      shapeRendering="crispEdges"
      style={{ filter: shadow ? `drop-shadow(${shadow})` : undefined }}
    >
      <rect width={total} height={total} fill={element.background} />
      {path && <path d={path} fill={element.foreground} />}
    </svg>
  )
}
