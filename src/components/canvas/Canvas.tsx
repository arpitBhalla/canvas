import { useEffect, useRef, useState } from 'react'
import { useEditorStore } from '../../store/editorStore'
import { useCanvasDropZone } from '../../hooks/useCanvasDropZone'
import CanvasElement from './CanvasElement'
import SnapGuides from './SnapGuides'
import ContextMenu from './ContextMenu'
import { pointsToD, simplifyFreehand } from '../../utils/path'
import type { CanvasElement as CanvasElementType, Position } from '../../types'

interface MarqueeRect {
  x: number
  y: number
  w: number
  h: number
}

export default function Canvas() {
  const template = useEditorStore((s) => s.template)
  const zoom = useEditorStore((s) => s.zoom)
  const clearSelection = useEditorStore((s) => s.clearSelection)
  const selectMany = useEditorStore((s) => s.selectMany)
  const selectElement = useEditorStore((s) => s.selectElement)
  const drawingMode = useEditorStore((s) => s.drawingMode)
  const setDrawingMode = useEditorStore((s) => s.setDrawingMode)
  const addPathFromCanvas = useEditorStore((s) => s.addPathFromCanvas)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const isDragging = useCanvasDropZone(wrapperRef)
  const [marquee, setMarquee] = useState<MarqueeRect | null>(null)
  const [drawPoints, setDrawPoints] = useState<Position[]>([])
  const [hoverPoint, setHoverPoint] = useState<Position | null>(null)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; element: CanvasElementType | null } | null>(null)

  const sorted = [...template.elements].sort((a, b) => a.zIndex - b.zIndex)

  function getCanvasCoords(clientX: number, clientY: number): Position | null {
    const stage = stageRef.current
    if (!stage) return null
    const rect = stage.getBoundingClientRect()
    return {
      x: (clientX - rect.left) / zoom,
      y: (clientY - rect.top) / zoom,
    }
  }

  function commitDraw(points: Position[]) {
    if (!drawingMode || points.length < 2) {
      setDrawPoints([])
      setHoverPoint(null)
      return
    }
    addPathFromCanvas(points, drawingMode)
    setDrawPoints([])
    setHoverPoint(null)
  }

  useEffect(() => {
    if (drawingMode === null) {
      setDrawPoints((prev) => (prev.length === 0 ? prev : []))
      setHoverPoint((prev) => (prev === null ? prev : null))
    }
  }, [drawingMode])

  useEffect(() => {
    if (!drawingMode) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setDrawingMode(null)
      } else if (e.key === 'Enter') {
        commitDraw(drawPoints)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawingMode, drawPoints])

  function handleStageMouseDown(e: React.MouseEvent) {
    if (e.button !== 0) return

    if (drawingMode) {
      const p = getCanvasCoords(e.clientX, e.clientY)
      if (!p) return

      if (drawingMode === 'freehand') {
        setDrawPoints([p])
        const points: Position[] = [p]

        function onMove(ev: MouseEvent) {
          const np = getCanvasCoords(ev.clientX, ev.clientY)
          if (!np) return
          points.push(np)
          setDrawPoints([...points])
        }
        function onUp() {
          window.removeEventListener('mousemove', onMove)
          window.removeEventListener('mouseup', onUp)
          commitDraw(simplifyFreehand(points))
        }
        window.addEventListener('mousemove', onMove)
        window.addEventListener('mouseup', onUp)
      } else {
        // straight or curve: each click adds a point. Double-click finalizes.
        if (e.detail === 2) {
          commitDraw(drawPoints)
        } else {
          setDrawPoints((prev) => [...prev, p])
        }
      }
      return
    }

    const target = e.target as HTMLElement
    if (target !== e.currentTarget && !target.dataset.canvasBg) return

    const stage = stageRef.current
    if (!stage) return
    const rect = stage.getBoundingClientRect()
    const startX = (e.clientX - rect.left) / zoom
    const startY = (e.clientY - rect.top) / zoom

    if (!e.shiftKey) clearSelection()

    let moved = false

    function onMove(ev: MouseEvent) {
      const x = (ev.clientX - rect.left) / zoom
      const y = (ev.clientY - rect.top) / zoom
      moved = true
      setMarquee({
        x: Math.min(startX, x),
        y: Math.min(startY, y),
        w: Math.abs(x - startX),
        h: Math.abs(y - startY),
      })
    }

    function onUp(ev: MouseEvent) {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      if (moved) {
        const x = (ev.clientX - rect.left) / zoom
        const y = (ev.clientY - rect.top) / zoom
        const r: MarqueeRect = {
          x: Math.min(startX, x),
          y: Math.min(startY, y),
          w: Math.abs(x - startX),
          h: Math.abs(y - startY),
        }
        const hits = template.elements
          .filter((el) => {
            const ex = el.position.x
            const ey = el.position.y
            const ew = el.size.width
            const eh = el.size.height
            return ex < r.x + r.w && ex + ew > r.x && ey < r.y + r.h && ey + eh > r.y
          })
          .map((el) => el.id)
        selectMany(hits)
      }
      setMarquee(null)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  function handleStageMouseMove(e: React.MouseEvent) {
    if (!drawingMode || drawingMode === 'freehand' || drawPoints.length === 0) return
    const p = getCanvasCoords(e.clientX, e.clientY)
    if (p) setHoverPoint(p)
  }

  function handleContextMenu(e: React.MouseEvent) {
    const target = e.target as HTMLElement
    let elId: string | null = null
    let cur: HTMLElement | null = target
    while (cur && cur !== stageRef.current) {
      if (cur.dataset?.elementId) {
        elId = cur.dataset.elementId
        break
      }
      cur = cur.parentElement
    }
    if (!elId) {
      const rndAncestor = target.closest('[data-rnd-element-id]') as HTMLElement | null
      if (rndAncestor) elId = rndAncestor.dataset.rndElementId ?? null
    }
    const el = elId ? template.elements.find((x) => x.id === elId) ?? null : null
    if (!el) return
    e.preventDefault()
    selectElement(el.id)
    setContextMenu({ x: e.clientX, y: e.clientY, element: el })
  }

  const previewPoints =
    drawingMode && drawingMode !== 'freehand' && hoverPoint && drawPoints.length > 0
      ? [...drawPoints, hoverPoint]
      : drawPoints

  return (
    <div
      ref={wrapperRef}
      className={`canvas-dot-bg scroll-thin relative flex-1 overflow-auto flex items-center justify-center transition-shadow ${
        isDragging ? 'ring-4 ring-violet-400 ring-inset' : ''
      } ${drawingMode ? 'cursor-crosshair' : ''}`}
    >
      <div
        className="my-12"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
        }}
      >
        <div
          ref={stageRef}
          data-canvas-bg="true"
          className="relative rounded-sm"
          onMouseDown={handleStageMouseDown}
          onMouseMove={handleStageMouseMove}
          onContextMenu={handleContextMenu}
          style={{
            width: template.canvasWidth,
            height: template.canvasHeight,
            backgroundColor: template.backgroundColor,
            cursor: drawingMode ? 'crosshair' : undefined,
            boxShadow:
              '0 1px 2px rgba(0,0,0,0.04), 0 12px 32px -8px rgba(0,0,0,0.18), 0 4px 12px -4px rgba(0,0,0,0.08)',
          }}
        >
          {sorted.map((el) => (
            <CanvasElement key={el.id} element={el} />
          ))}
          <SnapGuides />
          {previewPoints.length > 0 && drawingMode && (
            <svg
              className="absolute inset-0 pointer-events-none"
              width={template.canvasWidth}
              height={template.canvasHeight}
              viewBox={`0 0 ${template.canvasWidth} ${template.canvasHeight}`}
            >
              <path
                d={pointsToD(previewPoints, drawingMode, false)}
                fill="none"
                stroke="#7c3aed"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={drawingMode === 'freehand' ? undefined : '6 4'}
              />
              {drawPoints.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={4} fill="#fff" stroke="#7c3aed" strokeWidth={2} />
              ))}
            </svg>
          )}
          {marquee && (
            <div
              className="absolute pointer-events-none border border-violet-500 bg-violet-500/10"
              style={{
                left: marquee.x,
                top: marquee.y,
                width: marquee.w,
                height: marquee.h,
              }}
            />
          )}
        </div>
      </div>
      {isDragging && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="bg-violet-600 text-white text-sm font-medium px-4 py-2 rounded-full shadow-lg">
            Drop image to add
          </div>
        </div>
      )}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          element={contextMenu.element}
          onClose={() => setContextMenu(null)}
        />
      )}
      {drawingMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2">
          <span className="capitalize">{drawingMode} mode</span>
          <span className="text-gray-400">·</span>
          <span className="text-gray-300">
            {drawingMode === 'freehand'
              ? 'Drag to draw'
              : 'Click to add points · double-click or Enter to finish'}
          </span>
          <span className="text-gray-400">·</span>
          <button
            onClick={() => setDrawingMode(null)}
            className="text-gray-300 hover:text-white"
          >
            Esc
          </button>
        </div>
      )}
    </div>
  )
}
