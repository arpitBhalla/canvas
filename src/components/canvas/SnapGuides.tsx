import { useEditorStore } from '../../store/editorStore'

export default function SnapGuides() {
  const guides = useEditorStore((s) => s.snapGuides)
  const template = useEditorStore((s) => s.template)
  if (guides.length === 0) return null

  return (
    <>
      {guides.map((g, i) =>
        g.axis === 'x' ? (
          <div
            key={`x-${i}-${g.position}`}
            className="absolute pointer-events-none"
            style={{
              left: g.position - 0.5,
              top: 0,
              width: 1,
              height: template.canvasHeight,
              background: '#ec4899',
              boxShadow: '0 0 0 0.5px rgba(236, 72, 153, 0.4)',
            }}
          />
        ) : (
          <div
            key={`y-${i}-${g.position}`}
            className="absolute pointer-events-none"
            style={{
              top: g.position - 0.5,
              left: 0,
              height: 1,
              width: template.canvasWidth,
              background: '#ec4899',
              boxShadow: '0 0 0 0.5px rgba(236, 72, 153, 0.4)',
            }}
          />
        )
      )}
    </>
  )
}
