import { useEditorStore } from '../../store/editorStore'
import { replaceVariables, shouldHideForRecord, isVariableToken, variableTokenName } from '../../utils/variables'
import { shadowToCss, shapeFillCss } from '../../utils/style'
import { pointsToD } from '../../utils/path'
import QrElementRenderer from '../canvas/QrElement'
import ImageElementRenderer from '../canvas/ImageElement'
import type { TextElement, ShapeElement, ImageElement, PathElement, QrElement } from '../../types'

interface Props {
  data: Record<string, string>
}

export default function MergedCanvas({ data }: Props) {
  const template = useEditorStore((s) => s.template)

  const sorted = [...template.elements]
    .sort((a, b) => a.zIndex - b.zIndex)
    .filter((el) => el.visible !== false && !shouldHideForRecord(el.hideWhenEmpty, data))

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
          transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
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
                letterSpacing: t.letterSpacing != null ? `${t.letterSpacing}px` : undefined,
                padding: t.padding,
                textShadow: shadowToCss(t.shadow),
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
          if (s.shape === 'line' || s.shape === 'arrow') {
            const stroke = s.stroke && s.stroke !== 'transparent' ? s.stroke : s.fill
            const sw = Math.max(1, s.strokeWidth || 2)
            const markerId = `m-${s.id}`
            return (
              <svg
                key={el.id}
                style={{
                  ...baseStyle,
                  overflow: 'visible',
                  filter: shadowToCss(s.shadow) ? `drop-shadow(${shadowToCss(s.shadow)})` : undefined,
                }}
                viewBox={`0 0 ${s.size.width} ${s.size.height}`}
                preserveAspectRatio="none"
              >
                {s.shape === 'arrow' && (
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
                  y1={s.size.height / 2}
                  x2={s.size.width - sw / 2}
                  y2={s.size.height / 2}
                  stroke={stroke}
                  strokeWidth={sw}
                  strokeLinecap="round"
                  markerEnd={s.shape === 'arrow' ? `url(#${markerId})` : undefined}
                />
              </svg>
            )
          }
          const fillStyle = shapeFillCss(s)
          let clipPath: string | undefined
          let radius: number | string | undefined = s.borderRadius
          if (s.shape === 'circle') radius = '50%'
          else if (s.shape === 'triangle') {
            clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)'
            radius = 0
          } else if (s.shape === 'star') {
            clipPath =
              'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
            radius = 0
          }
          const usesClip = !!clipPath
          const shadow = shadowToCss(s.shadow)
          return (
            <div
              key={el.id}
              style={{
                ...baseStyle,
                ...fillStyle,
                border:
                  !usesClip && s.strokeWidth > 0 ? `${s.strokeWidth}px solid ${s.stroke}` : 'none',
                borderRadius: radius,
                clipPath,
                boxShadow: !usesClip ? shadow : undefined,
                filter: usesClip && shadow ? `drop-shadow(${shadow})` : undefined,
              }}
            />
          )
        }

        if (el.type === 'image') {
          const img = el as ImageElement
          let src = img.src
          if (isVariableToken(src)) {
            const name = variableTokenName(src)
            src = name ? data[name] ?? '' : ''
          }
          return (
            <div key={el.id} style={baseStyle}>
              <ImageElementRenderer element={img} src={src} />
            </div>
          )
        }

        if (el.type === 'qr') {
          const q = el as QrElement
          const resolved = isVariableToken(q.value) ? data[variableTokenName(q.value) ?? ''] ?? '' : q.value
          return (
            <div key={el.id} style={baseStyle}>
              <QrElementRenderer element={q} value={resolved} />
            </div>
          )
        }

        if (el.type === 'path') {
          const p = el as PathElement
          const shadow = shadowToCss(p.shadow)
          const showArrow = p.arrowhead && p.arrowhead !== 'none'
          const markerId = `pm-${p.id}`
          return (
            <svg
              key={el.id}
              style={{
                ...baseStyle,
                overflow: 'visible',
                filter: shadow ? `drop-shadow(${shadow})` : undefined,
              }}
              viewBox={`0 0 ${p.size.width} ${p.size.height}`}
              preserveAspectRatio="none"
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
                    <path d="M 0 0 L 10 5 L 0 10 z" fill={p.stroke} />
                  </marker>
                </defs>
              )}
              <path
                d={pointsToD(p.points, p.mode, p.closed)}
                fill={p.closed ? p.stroke : 'none'}
                stroke={p.closed && p.strokeWidth === 0 ? 'none' : p.stroke}
                strokeWidth={p.strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                markerEnd={
                  showArrow && (p.arrowhead === 'end' || p.arrowhead === 'both')
                    ? `url(#${markerId})`
                    : undefined
                }
                markerStart={showArrow && p.arrowhead === 'both' ? `url(#${markerId})` : undefined}
              />
            </svg>
          )
        }

        return null
      })}
    </div>
  )
}
