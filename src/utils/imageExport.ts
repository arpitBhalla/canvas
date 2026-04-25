import html2canvas from 'html2canvas'
import JSZip from 'jszip'
import type { Template } from '../types'
import { loadFontsForTemplate, waitForFontsReady } from './fonts'
import { renderPageToDOM } from './pdf'

const FILENAME_TOKEN = /\{\{(\w+)\}\}/g

function safeFilename(value: string, fallback: string): string {
  const cleaned = value.replace(/[\\/:*?"<>|]+/g, '_').trim()
  return cleaned.length > 0 ? cleaned : fallback
}

function buildFilename(
  pattern: string,
  index: number,
  data: Record<string, string>,
  templateName: string
): string {
  const resolved = pattern.replace(FILENAME_TOKEN, (_, name: string) => data[name] ?? '')
  if (resolved.trim().length > 0) return safeFilename(resolved, `${templateName}-${index + 1}`)
  return safeFilename(`${templateName}-${index + 1}`, `record-${index + 1}`)
}

interface ExportOptions {
  filenamePattern?: string
  scale?: number
  onProgress?: (current: number, total: number) => void
}

export async function exportRecordsAsZip(
  template: Template,
  records: Record<string, string>[],
  options: ExportOptions = {}
): Promise<void> {
  const scale = options.scale ?? 2
  const pattern = options.filenamePattern ?? `${template.name}-{{__index}}`

  loadFontsForTemplate(template)
  await waitForFontsReady()

  const zip = new JSZip()
  const usedNames = new Map<string, number>()

  for (let i = 0; i < records.length; i++) {
    const record = { ...records[i]!, __index: String(i + 1) }
    const container = renderPageToDOM(template, record)
    document.body.appendChild(container)
    await waitForFontsReady()
    await new Promise((r) => setTimeout(r, 50))

    const canvas = await html2canvas(container, {
      width: template.canvasWidth,
      height: template.canvasHeight,
      scale,
      useCORS: true,
      backgroundColor: template.backgroundColor,
    })
    document.body.removeChild(container)

    const blob: Blob = await new Promise((resolve, reject) =>
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Failed to encode image'))),
        'image/png'
      )
    )

    let baseName = buildFilename(pattern, i, record, template.name)
    const count = usedNames.get(baseName) ?? 0
    if (count > 0) baseName = `${baseName} (${count + 1})`
    usedNames.set(baseName, count + 1)

    zip.file(`${baseName}.png`, blob)
    options.onProgress?.(i + 1, records.length)
  }

  const archive = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(archive)
  const a = document.createElement('a')
  a.href = url
  a.download = `${safeFilename(template.name, 'images')}.zip`
  a.click()
  URL.revokeObjectURL(url)
}
