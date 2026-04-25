import { useRef } from 'react'
import { Rnd } from 'react-rnd'
import { useEditorStore } from '../../store/editorStore'
import type { CanvasElement as CanvasElementType, Position } from '../../types'
import type { SnapGuide } from '../../store/editorStore'
import TextElement from './TextElement'
import ShapeElement from './ShapeElement'
import ImageElement from './ImageElement'
import PathElement from './PathElement'
import QrElement from './QrElement'

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
      case 'qr':
        return <QrElement element={element} />
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
      data-rnd-element-id={element.id}
      disableDragging={element.locked || isEditingThis}
      enableResizing={!element.locked && isPrimarySelected}
      onMouseDown={(e: MouseEvent) => {
        e.stopPropagation()
        const { template, selectMany } = useEditorStore.getState()
        const peers = element.groupId
          ? template.elements.filter((x) => x.groupId === element.groupId).map((x) => x.id)
          : [element.id]
        if (e.shiftKey) {
          if (peers.length > 1 && peers.every((id) => selectedElementIds.includes(id))) {
            selectMany(selectedElementIds.filter((id) => !peers.includes(id)))
          } else {
            selectMany([...new Set([...selectedElementIds, ...peers])])
          }
        } else if (!peers.every((id) => selectedElementIds.includes(id))) {
          selectMany(peers)
        }
      }}
      style={{
        zIndex: element.zIndex,
        opacity: isVisible ? element.opacity : 0.3,
        outline,
        outlineOffset: '1px',
        cursor: isEditingThis ? 'text' : element.locked ? 'default' : 'move',
        transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
      }}
    >
      {renderElement()}
      {isPrimarySelected && !element.locked && !isEditingThis && (
        <RotationHandle elementId={element.id} />
      )}
    </Rnd>
  )
}

function RotationHandle({ elementId }: { elementId: string }) {
  return (
    <div
      onMouseDown={(e) => {
        e.stopPropagation()
        e.preventDefault()
        const handle = e.currentTarget as HTMLElement
        const wrapper = handle.parentElement as HTMLElement | null
        if (!wrapper) return
        const rect = wrapper.getBoundingClientRect()
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2

        useEditorStore.temporal.getState().pause()

        function onMove(ev: MouseEvent) {
          let angle = (Math.atan2(ev.clientY - cy, ev.clientX - cx) * 180) / Math.PI + 90
          if (ev.shiftKey) angle = Math.round(angle / 15) * 15
          angle = ((angle % 360) + 360) % 360
          useEditorStore.getState().updateElement(elementId, { rotation: angle })
        }
        function onUp() {
          window.removeEventListener('mousemove', onMove)
          window.removeEventListener('mouseup', onUp)
          useEditorStore.temporal.getState().resume()
        }
        window.addEventListener('mousemove', onMove)
        window.addEventListener('mouseup', onUp)
      }}
      style={{
        position: 'absolute',
        top: -28,
        left: '50%',
        width: 14,
        height: 14,
        marginLeft: -7,
        borderRadius: 9999,
        background: 'white',
        border: '2px solid #7c3aed',
        boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
        cursor: 'grab',
        zIndex: 10,
      }}
      title="Rotate (hold Shift to snap to 15°)"
    >
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 8,
          width: 1,
          height: 14,
          background: '#7c3aed',
          marginLeft: -0.5,
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
