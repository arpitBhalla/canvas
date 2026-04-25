import { useEffect, useRef, useState } from 'react'
import type { Template, TextElement, ShapeElement, ImageElement, PathElement, QrElement } from '../../types'
import { shapeFillCss } from '../../utils/style'
import { pointsToD } from '../../utils/path'
import QrElementRenderer from '../canvas/QrElement'

interface Props {
  template: Template
  className?: string
}

export default function TemplatePreview({ template, className = '' }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0)

  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    const update = () => {
      const w = el.clientWidth
      if (w > 0) setScale(w / template.canvasWidth)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [template.canvasWidth])

  const sorted = [...template.elements]
    .sort((a, b) => a.zIndex - b.zIndex)
    .filter((el) => el.visible !== false)

  return (
    <div
      ref={wrapperRef}
      className={`relative overflow-hidden ${className}`}
      style={{ aspectRatio: template.canvasWidth / template.canvasHeight }}
    >
      <div
        className="absolute top-0 left-0"
        style={{
          backgroundColor: template.backgroundColor,
          width: template.canvasWidth,
          height: template.canvasHeight,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          visibility: scale > 0 ? 'visible' : 'hidden',
        }}
      >
        {sorted.map((el) => {
          const baseStyle: React.CSSProperties = {
            position: 'absolute',
            left: el.position.x,
            top: el.position.y,
            width: el.size.width,
            height: el.size.height,
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
                  overflow: 'hidden',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  boxSizing: 'border-box',
                }}
              >
                {t.content}
              </div>
            )
          }
          if (el.type === 'shape') {
            const s = el as ShapeElement
            if (s.shape === 'line' || s.shape === 'arrow') {
              const stroke = s.stroke && s.stroke !== 'transparent' ? s.stroke : s.fill
              const sw = Math.max(1, s.strokeWidth || 2)
              return (
                <svg
                  key={el.id}
                  style={{ ...baseStyle, overflow: 'visible' }}
                  viewBox={`0 0 ${s.size.width} ${s.size.height}`}
                  preserveAspectRatio="none"
                >
                  <line
                    x1={sw / 2}
                    y1={s.size.height / 2}
                    x2={s.size.width - sw / 2}
                    y2={s.size.height / 2}
                    stroke={stroke}
                    strokeWidth={sw}
                    strokeLinecap="round"
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
            return (
              <div
                key={el.id}
                style={{
                  ...baseStyle,
                  ...fillStyle,
                  border:
                    !clipPath && s.strokeWidth > 0
                      ? `${s.strokeWidth}px solid ${s.stroke}`
                      : undefined,
                  borderRadius: radius,
                  clipPath,
                  boxSizing: 'border-box',
                }}
              />
            )
          }
          if (el.type === 'qr') {
            const q = el as QrElement
            return (
              <div key={el.id} style={baseStyle}>
                <QrElementRenderer element={q} />
              </div>
            )
          }
          if (el.type === 'path') {
            const p = el as PathElement
            return (
              <svg
                key={el.id}
                style={{ ...baseStyle, overflow: 'visible' }}
                viewBox={`0 0 ${p.size.width} ${p.size.height}`}
                preserveAspectRatio="none"
              >
                <path
                  d={pointsToD(p.points, p.mode, p.closed)}
                  fill={p.closed ? p.stroke : 'none'}
                  fillOpacity={p.closed ? 0.1 : 0}
                  stroke={p.stroke}
                  strokeWidth={p.strokeWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )
          }
          const img = el as ImageElement
          if (!img.src || img.src.startsWith('{{')) return null
          return (
            <img
              key={el.id}
              src={img.src}
              alt=""
              draggable={false}
              style={{
                ...baseStyle,
                objectFit: img.objectFit,
                borderRadius: img.borderRadius,
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
