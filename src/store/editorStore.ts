import { create } from 'zustand'
import { temporal } from 'zundo'
import type { CanvasElement, TextElement, ShapeElement, ImageElement, PathElement, PathMode, Position, Size, DataSource, Template } from '../types'
import { DEFAULT_TEXT, DEFAULT_SHAPE, DEFAULT_IMAGE, CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants/defaults'
import { createId } from '../utils/ids'

export type AlignAxis = 'left' | 'center-h' | 'right' | 'top' | 'center-v' | 'bottom'
export type DistributeAxis = 'horizontal' | 'vertical'

export interface SnapGuide {
  axis: 'x' | 'y'
  position: number
}

interface EditorState {
  template: Template
  selectedElementIds: string[]
  editingTextId: string | null
  dataSource: DataSource | null
  previewOpen: boolean
  previewRecordIndex: number
  zoom: number
  snapGuides: SnapGuide[]
  setSnapGuides: (guides: SnapGuide[]) => void
  drawingMode: PathMode | null
  setDrawingMode: (mode: PathMode | null) => void
  addPathFromCanvas: (canvasPoints: Position[], mode: PathMode, options?: { closed?: boolean; arrowhead?: 'none' | 'end' | 'both' }) => void
  addBrandColor: (color: string) => void
  removeBrandColor: (color: string) => void

  addElement: (type: 'text' | 'shape' | 'image', extra?: Partial<CanvasElement>) => void
  updateElement: (id: string, updates: Partial<CanvasElement>) => void
  deleteElement: (id: string) => void
  deleteSelected: () => void
  duplicateElement: (id: string) => void
  duplicateSelected: () => void
  moveElement: (id: string, position: Position) => void
  moveSelectedBy: (dx: number, dy: number) => void
  resizeElement: (id: string, size: Size, position?: Position) => void

  selectElement: (id: string | null) => void
  toggleSelectElement: (id: string) => void
  selectMany: (ids: string[]) => void
  clearSelection: () => void

  setEditingText: (id: string | null) => void
  reorderElement: (id: string, direction: 'up' | 'down' | 'top' | 'bottom') => void
  setElementZOrder: (orderedIds: string[]) => void

  alignSelected: (axis: AlignAxis) => void
  distributeSelected: (axis: DistributeAxis) => void

  setDataSource: (data: DataSource) => void
  clearDataSource: () => void
  togglePreview: () => void
  setPreviewRecordIndex: (index: number) => void
  setZoom: (zoom: number) => void

  loadProject: (template: Template) => void
  resetEditor: () => void
}

function getNextZIndex(elements: CanvasElement[]): number {
  if (elements.length === 0) return 1
  return Math.max(...elements.map((e) => e.zIndex)) + 1
}

function bboxOf(els: CanvasElement[]): { left: number; top: number; right: number; bottom: number } {
  let left = Infinity
  let top = Infinity
  let right = -Infinity
  let bottom = -Infinity
  for (const el of els) {
    if (el.position.x < left) left = el.position.x
    if (el.position.y < top) top = el.position.y
    if (el.position.x + el.size.width > right) right = el.position.x + el.size.width
    if (el.position.y + el.size.height > bottom) bottom = el.position.y + el.size.height
  }
  return { left, top, right, bottom }
}

export const useEditorStore = create<EditorState>()(
  temporal(
    (set, get) => ({
      template: {
        id: createId(),
        name: 'Untitled Template',
        canvasWidth: CANVAS_WIDTH,
        canvasHeight: CANVAS_HEIGHT,
        backgroundColor: '#ffffff',
        elements: [],
      },
      selectedElementIds: [],
      editingTextId: null,
      dataSource: null,
      previewOpen: false,
      previewRecordIndex: 0,
      zoom: 1,
      snapGuides: [],
      setSnapGuides: (guides) => set({ snapGuides: guides }),
      drawingMode: null,
      setDrawingMode: (mode) => set({ drawingMode: mode }),

      addPathFromCanvas: (canvasPoints, mode, options) => {
        if (canvasPoints.length < 2) return
        const minX = Math.min(...canvasPoints.map((p) => p.x))
        const minY = Math.min(...canvasPoints.map((p) => p.y))
        const maxX = Math.max(...canvasPoints.map((p) => p.x))
        const maxY = Math.max(...canvasPoints.map((p) => p.y))
        const strokeWidth = 3
        const pad = strokeWidth + 4
        const x = minX - pad
        const y = minY - pad
        const width = Math.max(1, maxX - minX) + pad * 2
        const height = Math.max(1, maxY - minY) + pad * 2
        const localPoints = canvasPoints.map((p) => ({ x: p.x - x, y: p.y - y }))

        const id = createId()
        const { template } = get()
        const zIndex = getNextZIndex(template.elements)
        const path: PathElement = {
          id,
          type: 'path',
          mode,
          points: localPoints,
          stroke: '#1f2937',
          strokeWidth,
          closed: options?.closed ?? false,
          arrowhead: options?.arrowhead ?? 'none',
          position: { x, y },
          size: { width, height },
          rotation: 0,
          locked: false,
          zIndex,
          opacity: 1,
        }
        set({
          template: { ...template, elements: [...template.elements, path] },
          selectedElementIds: [id],
          drawingMode: null,
        })
      },

      addBrandColor: (color) => {
        set((state) => {
          const current = state.template.brandColors ?? []
          if (current.includes(color)) return state
          return {
            template: { ...state.template, brandColors: [...current, color].slice(-24) },
          }
        })
      },

      removeBrandColor: (color) => {
        set((state) => ({
          template: {
            ...state.template,
            brandColors: (state.template.brandColors ?? []).filter((c) => c !== color),
          },
        }))
      },

      addElement: (type, extra) => {
        const id = createId()
        const { template } = get()
        const zIndex = getNextZIndex(template.elements)
        let el: CanvasElement

        if (type === 'text') {
          el = { ...DEFAULT_TEXT, id, zIndex, ...extra } as TextElement
        } else if (type === 'shape') {
          el = { ...DEFAULT_SHAPE, id, zIndex, ...extra } as ShapeElement
        } else {
          el = { ...DEFAULT_IMAGE, id, zIndex, ...extra } as ImageElement
        }

        set({
          template: { ...template, elements: [...template.elements, el] },
          selectedElementIds: [id],
        })
      },

      updateElement: (id, updates) => {
        set((state) => ({
          template: {
            ...state.template,
            elements: state.template.elements.map((el) =>
              el.id === id ? { ...el, ...updates } as CanvasElement : el
            ),
          },
        }))
      },

      deleteElement: (id) => {
        set((state) => ({
          template: {
            ...state.template,
            elements: state.template.elements.filter((el) => el.id !== id),
          },
          selectedElementIds: state.selectedElementIds.filter((s) => s !== id),
          editingTextId: state.editingTextId === id ? null : state.editingTextId,
        }))
      },

      deleteSelected: () => {
        const { selectedElementIds } = get()
        if (selectedElementIds.length === 0) return
        set((state) => ({
          template: {
            ...state.template,
            elements: state.template.elements.filter((el) => !selectedElementIds.includes(el.id)),
          },
          selectedElementIds: [],
          editingTextId: state.editingTextId && selectedElementIds.includes(state.editingTextId)
            ? null
            : state.editingTextId,
        }))
      },

      duplicateElement: (id) => {
        const { template } = get()
        const el = template.elements.find((e) => e.id === id)
        if (!el) return
        const newId = createId()
        const dupe = {
          ...el,
          id: newId,
          position: { x: el.position.x + 20, y: el.position.y + 20 },
          zIndex: getNextZIndex(template.elements),
        } as CanvasElement
        set({
          template: { ...template, elements: [...template.elements, dupe] },
          selectedElementIds: [newId],
        })
      },

      duplicateSelected: () => {
        const { template, selectedElementIds } = get()
        if (selectedElementIds.length === 0) return
        const idMap: Record<string, string> = {}
        const additions: CanvasElement[] = []
        let nextZ = getNextZIndex(template.elements)
        for (const id of selectedElementIds) {
          const el = template.elements.find((e) => e.id === id)
          if (!el) continue
          const newId = createId()
          idMap[id] = newId
          additions.push({
            ...el,
            id: newId,
            position: { x: el.position.x + 20, y: el.position.y + 20 },
            zIndex: nextZ++,
          } as CanvasElement)
        }
        set({
          template: { ...template, elements: [...template.elements, ...additions] },
          selectedElementIds: Object.values(idMap),
        })
      },

      moveElement: (id, position) => {
        set((state) => ({
          template: {
            ...state.template,
            elements: state.template.elements.map((el) =>
              el.id === id ? { ...el, position } as CanvasElement : el
            ),
          },
        }))
      },

      moveSelectedBy: (dx, dy) => {
        const { selectedElementIds } = get()
        if (selectedElementIds.length === 0 || (dx === 0 && dy === 0)) return
        set((state) => ({
          template: {
            ...state.template,
            elements: state.template.elements.map((el) =>
              selectedElementIds.includes(el.id) && !el.locked
                ? { ...el, position: { x: el.position.x + dx, y: el.position.y + dy } } as CanvasElement
                : el
            ),
          },
        }))
      },

      resizeElement: (id, size, position) => {
        set((state) => ({
          template: {
            ...state.template,
            elements: state.template.elements.map((el) =>
              el.id === id
                ? { ...el, size, ...(position ? { position } : {}) } as CanvasElement
                : el
            ),
          },
        }))
      },

      selectElement: (id) => {
        set({ selectedElementIds: id ? [id] : [], editingTextId: null })
      },

      toggleSelectElement: (id) => {
        set((state) => {
          const has = state.selectedElementIds.includes(id)
          return {
            selectedElementIds: has
              ? state.selectedElementIds.filter((s) => s !== id)
              : [...state.selectedElementIds, id],
            editingTextId: null,
          }
        })
      },

      selectMany: (ids) => {
        set({ selectedElementIds: ids, editingTextId: null })
      },

      clearSelection: () => {
        set({ selectedElementIds: [], editingTextId: null })
      },

      setEditingText: (id) => {
        set({ editingTextId: id })
      },

      reorderElement: (id, direction) => {
        set((state) => {
          const elements = [...state.template.elements]
          const idx = elements.findIndex((e) => e.id === id)
          if (idx === -1) return state

          const sorted = elements.sort((a, b) => a.zIndex - b.zIndex)
          const sortedIdx = sorted.findIndex((e) => e.id === id)

          if (direction === 'top') {
            sorted[sortedIdx]!.zIndex = getNextZIndex(elements)
          } else if (direction === 'bottom') {
            const minZ = Math.min(...sorted.map((e) => e.zIndex))
            sorted[sortedIdx]!.zIndex = minZ - 1
          } else if (direction === 'up' && sortedIdx < sorted.length - 1) {
            const currentZ = sorted[sortedIdx]!.zIndex
            sorted[sortedIdx]!.zIndex = sorted[sortedIdx + 1]!.zIndex
            sorted[sortedIdx + 1]!.zIndex = currentZ
          } else if (direction === 'down' && sortedIdx > 0) {
            const currentZ = sorted[sortedIdx]!.zIndex
            sorted[sortedIdx]!.zIndex = sorted[sortedIdx - 1]!.zIndex
            sorted[sortedIdx - 1]!.zIndex = currentZ
          }

          return { template: { ...state.template, elements: sorted } }
        })
      },

      setElementZOrder: (orderedIds) => {
        set((state) => {
          const byId = new Map(state.template.elements.map((el) => [el.id, el]))
          const next = orderedIds
            .map((id, i) => {
              const el = byId.get(id)
              return el ? ({ ...el, zIndex: i + 1 } as CanvasElement) : null
            })
            .filter((x): x is CanvasElement => x !== null)
          return { template: { ...state.template, elements: next } }
        })
      },

      alignSelected: (axis) => {
        const { template, selectedElementIds } = get()
        if (selectedElementIds.length < 2) return
        const sel = template.elements.filter((e) => selectedElementIds.includes(e.id) && !e.locked)
        if (sel.length < 2) return
        const box = bboxOf(sel)
        const cx = (box.left + box.right) / 2
        const cy = (box.top + box.bottom) / 2

        const moves: Record<string, Position> = {}
        for (const el of sel) {
          let { x, y } = el.position
          if (axis === 'left') x = box.left
          else if (axis === 'right') x = box.right - el.size.width
          else if (axis === 'center-h') x = cx - el.size.width / 2
          else if (axis === 'top') y = box.top
          else if (axis === 'bottom') y = box.bottom - el.size.height
          else if (axis === 'center-v') y = cy - el.size.height / 2
          moves[el.id] = { x: Math.round(x), y: Math.round(y) }
        }

        set({
          template: {
            ...template,
            elements: template.elements.map((el) =>
              moves[el.id] ? ({ ...el, position: moves[el.id]! } as CanvasElement) : el
            ),
          },
        })
      },

      distributeSelected: (axis) => {
        const { template, selectedElementIds } = get()
        if (selectedElementIds.length < 3) return
        const sel = template.elements.filter((e) => selectedElementIds.includes(e.id) && !e.locked)
        if (sel.length < 3) return

        const sorted = [...sel].sort((a, b) =>
          axis === 'horizontal'
            ? a.position.x + a.size.width / 2 - (b.position.x + b.size.width / 2)
            : a.position.y + a.size.height / 2 - (b.position.y + b.size.height / 2)
        )

        const first = sorted[0]!
        const last = sorted[sorted.length - 1]!
        const firstCenter =
          axis === 'horizontal'
            ? first.position.x + first.size.width / 2
            : first.position.y + first.size.height / 2
        const lastCenter =
          axis === 'horizontal'
            ? last.position.x + last.size.width / 2
            : last.position.y + last.size.height / 2
        const step = (lastCenter - firstCenter) / (sorted.length - 1)

        const moves: Record<string, Position> = {}
        sorted.forEach((el, i) => {
          if (i === 0 || i === sorted.length - 1) return
          const targetCenter = firstCenter + step * i
          if (axis === 'horizontal') {
            moves[el.id] = { x: Math.round(targetCenter - el.size.width / 2), y: el.position.y }
          } else {
            moves[el.id] = { x: el.position.x, y: Math.round(targetCenter - el.size.height / 2) }
          }
        })

        set({
          template: {
            ...template,
            elements: template.elements.map((el) =>
              moves[el.id] ? ({ ...el, position: moves[el.id]! } as CanvasElement) : el
            ),
          },
        })
      },

      setDataSource: (data) => set({ dataSource: data }),
      clearDataSource: () => set({ dataSource: null }),

      togglePreview: () => set((s) => ({ previewOpen: !s.previewOpen, previewRecordIndex: 0 })),
      setPreviewRecordIndex: (index) => set({ previewRecordIndex: index }),

      setZoom: (zoom) => set({ zoom: Math.min(2, Math.max(0.25, zoom)) }),

      loadProject: (template) => {
        set({
          template,
          selectedElementIds: [],
          editingTextId: null,
          dataSource: null,
          previewOpen: false,
          previewRecordIndex: 0,
          zoom: 1,
        })
        useEditorStore.temporal.getState().clear()
      },

      resetEditor: () => {
        set({
          template: {
            id: createId(),
            name: 'Untitled Template',
            canvasWidth: CANVAS_WIDTH,
            canvasHeight: CANVAS_HEIGHT,
            backgroundColor: '#ffffff',
            elements: [],
          },
          selectedElementIds: [],
          editingTextId: null,
          dataSource: null,
          previewOpen: false,
          previewRecordIndex: 0,
          zoom: 1,
        })
        useEditorStore.temporal.getState().clear()
      },
    }),
    {
      limit: 50,
      partialize: (state) => ({ template: state.template }),
    }
  )
)
