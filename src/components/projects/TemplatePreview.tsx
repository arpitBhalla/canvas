import { useEffect, useRef, useState } from 'react'
import type { Template, TextElement, ShapeElement, ImageElement } from '../../types'

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

  const sorted = [...template.elements].sort((a, b) => a.zIndex - b.zIndex)

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
            return (
              <div
                key={el.id}
                style={{
                  ...baseStyle,
                  backgroundColor: s.fill,
                  border: s.strokeWidth > 0 ? `${s.strokeWidth}px solid ${s.stroke}` : undefined,
                  borderRadius: s.shape === 'circle' ? '50%' : s.borderRadius,
                  boxSizing: 'border-box',
                }}
              />
            )
          }
          const img = el as ImageElement
          if (!img.src) return null
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
