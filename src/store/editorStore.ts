import { create } from 'zustand'
import { temporal } from 'zundo'
import type { CanvasElement, TextElement, ShapeElement, ImageElement, Position, Size, DataSource, Template } from '../types'
import { DEFAULT_TEXT, DEFAULT_SHAPE, DEFAULT_IMAGE, CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants/defaults'
import { createId } from '../utils/ids'

interface EditorState {
  template: Template
  selectedElementId: string | null
  editingTextId: string | null
  dataSource: DataSource | null
  previewOpen: boolean
  previewRecordIndex: number
  zoom: number

  addElement: (type: CanvasElement['type'], extra?: Partial<CanvasElement>) => void
  updateElement: (id: string, updates: Partial<CanvasElement>) => void
  deleteElement: (id: string) => void
  duplicateElement: (id: string) => void
  moveElement: (id: string, position: Position) => void
  resizeElement: (id: string, size: Size, position?: Position) => void
  selectElement: (id: string | null) => void
  setEditingText: (id: string | null) => void
  reorderElement: (id: string, direction: 'up' | 'down' | 'top' | 'bottom') => void

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
      selectedElementId: null,
      editingTextId: null,
      dataSource: null,
      previewOpen: false,
      previewRecordIndex: 0,
      zoom: 1,

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
          selectedElementId: id,
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
          selectedElementId: state.selectedElementId === id ? null : state.selectedElementId,
          editingTextId: state.editingTextId === id ? null : state.editingTextId,
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
          selectedElementId: newId,
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
        set({ selectedElementId: id, editingTextId: null })
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

      setDataSource: (data) => set({ dataSource: data }),
      clearDataSource: () => set({ dataSource: null }),

      togglePreview: () => set((s) => ({ previewOpen: !s.previewOpen, previewRecordIndex: 0 })),
      setPreviewRecordIndex: (index) => set({ previewRecordIndex: index }),

      setZoom: (zoom) => set({ zoom: Math.min(2, Math.max(0.25, zoom)) }),

      loadProject: (template) => {
        set({
          template,
          selectedElementId: null,
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
          selectedElementId: null,
          editingTextId: null,
          dataSource: null,
          previewOpen: false,
          previewRecordIndex: 0,
          zoom: 1,
        })
        useEditorStore.temporal.getState().clear()
      },
    }),
    { limit: 50 }
  )
)
