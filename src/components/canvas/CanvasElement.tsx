import { useRef } from 'react'
import { Rnd } from 'react-rnd'
import { useEditorStore } from '../../store/editorStore'
import type { CanvasElement as CanvasElementType, Position } from '../../types'
import type { SnapGuide } from '../../store/editorStore'
import TextElement from './TextElement'
import ShapeElement from './ShapeElement'
import ImageElement from './ImageElement'
import PathElement from './PathElement'

interface Props {
  element: CanvasElementType
}

const SNAP_THRESHOLD = 6

interface SnapResult {
  x: number
  y: number
  guides: SnapGuide[]
}

function computeSnap(
  element: CanvasElementType,
  candidateX: number,
  candidateY: number,
  others: CanvasElementType[],
  canvasWidth: number,
  canvasHeight: number
): SnapResult {
  const w = element.size.width
  const h = element.size.height

  const xTargets: number[] = [0, canvasWidth / 2, canvasWidth]
  const yTargets: number[] = [0, canvasHeight / 2, canvasHeight]
  for (const o of others) {
    xTargets.push(o.position.x, o.position.x + o.size.width / 2, o.position.x + o.size.width)
    yTargets.push(o.position.y, o.position.y + o.size.height / 2, o.position.y + o.size.height)
  }

  let bestX = candidateX
  let bestXDist = SNAP_THRESHOLD
  let xGuide: number | null = null
  for (const t of xTargets) {
    const candidates: { offset: number; computed: number }[] = [
      { offset: 0, computed: candidateX },
      { offset: w / 2, computed: candidateX + w / 2 },
      { offset: w, computed: candidateX + w },
    ]
    for (const c of candidates) {
      const dist = Math.abs(t - c.computed)
      if (dist < bestXDist) {
        bestXDist = dist
        bestX = t - c.offset
        xGuide = t
      }
    }
  }

  let bestY = candidateY
  let bestYDist = SNAP_THRESHOLD
  let yGuide: number | null = null
  for (const t of yTargets) {
    const candidates: { offset: number; computed: number }[] = [
      { offset: 0, computed: candidateY },
      { offset: h / 2, computed: candidateY + h / 2 },
      { offset: h, computed: candidateY + h },
    ]
    for (const c of candidates) {
      const dist = Math.abs(t - c.computed)
      if (dist < bestYDist) {
        bestYDist = dist
        bestY = t - c.offset
        yGuide = t
      }
    }
  }

  const guides: SnapGuide[] = []
  if (xGuide !== null) guides.push({ axis: 'x', position: xGuide })
  if (yGuide !== null) guides.push({ axis: 'y', position: yGuide })

  return { x: Math.round(bestX), y: Math.round(bestY), guides }
}

export default function CanvasElement({ element }: Props) {
  const selectedElementIds = useEditorStore((s) => s.selectedElementIds)
  const editingTextId = useEditorStore((s) => s.editingTextId)
  const selectElement = useEditorStore((s) => s.selectElement)
  const toggleSelectElement = useEditorStore((s) => s.toggleSelectElement)
  const moveElement = useEditorStore((s) => s.moveElement)
  const resizeElement = useEditorStore((s) => s.resizeElement)
  const setSnapGuides = useEditorStore((s) => s.setSnapGuides)

  const isSelected = selectedElementIds.includes(element.id)
  const isPrimarySelected = isSelected && selectedElementIds.length === 1
  const isMultiDrag = isSelected && selectedElementIds.length > 1
  const isEditingThis = editingTextId === element.id
  const isVisible = element.visible !== false

  const dragStartRef = useRef<Map<string, Position> | null>(null)

  function renderElement() {
    switch (element.type) {
      case 'text':
        return <TextElement element={element} />
      case 'shape':
        return <ShapeElement element={element} />
      case 'image':
        return <ImageElement element={element} />
      case 'path':
        return <PathElement element={element} />
    }
  }

  const outline = isSelected
    ? selectedElementIds.length > 1
      ? '2px solid #ec4899'
      : '2px solid #7c3aed'
    : 'none'

  return (
    <Rnd
      position={{ x: element.position.x, y: element.position.y }}
      size={{ width: element.size.width, height: element.size.height }}
      onDragStart={() => {
        useEditorStore.temporal.getState().pause()
        if (isMultiDrag) {
          const { template } = useEditorStore.getState()
          const map = new Map<string, Position>()
          for (const id of selectedElementIds) {
            const e = template.elements.find((x) => x.id === id)
            if (e) map.set(id, { ...e.position })
          }
          dragStartRef.current = map
        } else {
          dragStartRef.current = null
        }
      }}
      onDrag={(_e, d) => {
        const { template } = useEditorStore.getState()
        const others = template.elements.filter(
          (e) => e.id !== element.id && !selectedElementIds.includes(e.id)
        )
        const snap = computeSnap(element, d.x, d.y, others, template.canvasWidth, template.canvasHeight)
        setSnapGuides(snap.guides)

        const startMap = dragStartRef.current
        if (startMap && isMultiDrag) {
          const startA = startMap.get(element.id)
          if (!startA) return
          const dx = d.x - startA.x
          const dy = d.y - startA.y
          useEditorStore.setState((state) => ({
            template: {
              ...state.template,
              elements: state.template.elements.map((el) => {
                if (el.id === element.id) return el
                if (!startMap.has(el.id) || el.locked) return el
                const s = startMap.get(el.id)!
                return { ...el, position: { x: s.x + dx, y: s.y + dy } }
              }),
            },
          }))
        }
      }}
      onDragStop={(_e, d) => {
        const { template } = useEditorStore.getState()
        const others = template.elements.filter(
          (e) => e.id !== element.id && !selectedElementIds.includes(e.id)
        )
        const snap = computeSnap(element, d.x, d.y, others, template.canvasWidth, template.canvasHeight)

        const startMap = dragStartRef.current
        if (startMap && isMultiDrag) {
          const startA = startMap.get(element.id)
          if (startA) {
            const dx = snap.x - startA.x
            const dy = snap.y - startA.y
            useEditorStore.setState((state) => ({
              template: {
                ...state.template,
                elements: state.template.elements.map((el) => {
                  if (!startMap.has(el.id) || el.locked) return el
                  const s = startMap.get(el.id)!
                  return { ...el, position: { x: s.x + dx, y: s.y + dy } }
                }),
              },
            }))
          }
        } else {
          moveElement(element.id, { x: snap.x, y: snap.y })
        }

        dragStartRef.current = null
        setSnapGuides([])
        useEditorStore.temporal.getState().resume()
      }}
      onResizeStop={(_e, _dir, ref, _delta, position) => {
        resizeElement(
          element.id,
          { width: parseInt(ref.style.width), height: parseInt(ref.style.height) },
          position
        )
      }}
      bounds="parent"
      disableDragging={element.locked || isEditingThis}
      enableResizing={!element.locked && isPrimarySelected}
      onMouseDown={(e: MouseEvent) => {
        e.stopPropagation()
        if (e.shiftKey) {
          toggleSelectElement(element.id)
        } else if (!isSelected) {
          selectElement(element.id)
        }
      }}
      style={{
        zIndex: element.zIndex,
        opacity: isVisible ? element.opacity : 0.3,
        outline,
        outlineOffset: '1px',
        cursor: isEditingThis ? 'text' : element.locked ? 'default' : 'move',
      }}
    >
      {renderElement()}
    </Rnd>
  )
}
