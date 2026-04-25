import { useEffect } from 'react'
import { useEditorStore } from '../store/editorStore'

const MAX_DIM = 1600

function readBlobAsDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error)
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.readAsDataURL(blob)
  })
}

function decodeImage(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onerror = () => reject(new Error('decode failed'))
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
    img.src = src
  })
}

export function useClipboardPaste() {
  useEffect(() => {
    async function handlePaste(e: ClipboardEvent) {
      const target = e.target as HTMLElement | null
      if (target && (target.isContentEditable || ['INPUT', 'TEXTAREA'].includes(target.tagName))) {
        return
      }
      const items = e.clipboardData?.items
      if (!items) return

      const imageItems: DataTransferItem[] = []
      for (const item of Array.from(items)) {
        if (item.kind === 'file' && item.type.startsWith('image/')) imageItems.push(item)
      }
      if (imageItems.length === 0) return

      e.preventDefault()
      const { template, addElement } = useEditorStore.getState()

      let offset = 0
      for (const item of imageItems) {
        const file = item.getAsFile()
        if (!file) continue
        try {
          const src = await readBlobAsDataURL(file)
          const dim = await decodeImage(src)
          const ratio = Math.min(
            1,
            MAX_DIM / Math.max(dim.width, dim.height),
            template.canvasWidth / dim.width,
            template.canvasHeight / dim.height
          )
          const width = Math.round(dim.width * ratio)
          const height = Math.round(dim.height * ratio)
          const x = Math.max(
            0,
            Math.min(template.canvasWidth - width, (template.canvasWidth - width) / 2 + offset)
          )
          const y = Math.max(
            0,
            Math.min(template.canvasHeight - height, (template.canvasHeight - height) / 2 + offset)
          )
          addElement('image', {
            src,
            size: { width, height },
            position: { x, y },
            naturalWidth: dim.width,
            naturalHeight: dim.height,
          })
          offset += 20
        } catch {
          // skip
        }
      }
    }

    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [])
}
