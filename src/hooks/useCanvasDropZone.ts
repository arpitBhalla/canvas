import { useEffect, useState } from 'react'
import type { RefObject } from 'react'
import { useEditorStore } from '../store/editorStore'

interface LoadedImage {
  src: string
  width: number
  height: number
}

function readFileAsImage(file: File): Promise<LoadedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'))
    reader.onload = () => {
      const src = String(reader.result ?? '')
      const img = new Image()
      img.onerror = () => reject(new Error('Failed to decode image'))
      img.onload = () => resolve({ src, width: img.naturalWidth, height: img.naturalHeight })
      img.src = src
    }
    reader.readAsDataURL(file)
  })
}

function fitWithin(width: number, height: number, maxW: number, maxH: number) {
  if (width <= maxW && height <= maxH) return { width, height }
  const ratio = Math.min(maxW / width, maxH / height)
  return { width: Math.round(width * ratio), height: Math.round(height * ratio) }
}

export function useCanvasDropZone(ref: RefObject<HTMLElement | null>) {
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let depth = 0

    function hasFiles(e: DragEvent): boolean {
      return Array.from(e.dataTransfer?.types ?? []).includes('Files')
    }

    function handleEnter(e: DragEvent) {
      if (!hasFiles(e)) return
      depth += 1
      setIsDragging(true)
    }

    function handleOver(e: DragEvent) {
      if (!hasFiles(e)) return
      e.preventDefault()
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'
    }

    function handleLeave() {
      depth = Math.max(0, depth - 1)
      if (depth === 0) setIsDragging(false)
    }

    async function handleDrop(e: DragEvent) {
      if (!hasFiles(e)) return
      e.preventDefault()
      depth = 0
      setIsDragging(false)

      const files = Array.from(e.dataTransfer?.files ?? []).filter((f) => f.type.startsWith('image/'))
      if (files.length === 0) return

      const { template, zoom, addElement } = useEditorStore.getState()

      const stage = el!.querySelector<HTMLElement>('[data-canvas-bg="true"]')
      const rect = stage?.getBoundingClientRect()
      const baseX = rect ? (e.clientX - rect.left) / zoom : 50
      const baseY = rect ? (e.clientY - rect.top) / zoom : 50

      let offset = 0
      for (const file of files) {
        try {
          const img = await readFileAsImage(file)
          const fitted = fitWithin(img.width, img.height, template.canvasWidth, template.canvasHeight)
          const x = Math.max(0, Math.min(template.canvasWidth - fitted.width, baseX - fitted.width / 2 + offset))
          const y = Math.max(0, Math.min(template.canvasHeight - fitted.height, baseY - fitted.height / 2 + offset))
          addElement('image', {
            src: img.src,
            position: { x, y },
            size: fitted,
            naturalWidth: img.width,
            naturalHeight: img.height,
          })
          offset += 20
        } catch {
          // skip file
        }
      }
    }

    el.addEventListener('dragenter', handleEnter)
    el.addEventListener('dragover', handleOver)
    el.addEventListener('dragleave', handleLeave)
    el.addEventListener('drop', handleDrop)

    return () => {
      el.removeEventListener('dragenter', handleEnter)
      el.removeEventListener('dragover', handleOver)
      el.removeEventListener('dragleave', handleLeave)
      el.removeEventListener('drop', handleDrop)
    }
  }, [ref])

  return isDragging
}
