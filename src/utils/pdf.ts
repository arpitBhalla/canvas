import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import type { Template, TextElement, ShapeElement, ImageElement } from '../types'
import { replaceVariables } from './variables'
import { loadFontsForTemplate, waitForFontsReady } from './fonts'

function renderPageToDOM(
  template: Template,
  data: Record<string, string>
): HTMLDivElement {
  const container = document.createElement('div')
  container.style.position = 'absolute'
  container.style.left = '-9999px'
  container.style.top = '0'
  container.style.width = `${template.canvasWidth}px`
  container.style.height = `${template.canvasHeight}px`
  container.style.backgroundColor = template.backgroundColor
  container.style.overflow = 'hidden'

  const sorted = [...template.elements].sort((a, b) => a.zIndex - b.zIndex)

  for (const el of sorted) {
    const div = document.createElement('div')
    div.style.position = 'absolute'
    div.style.left = `${el.position.x}px`
    div.style.top = `${el.position.y}px`
    div.style.width = `${el.size.width}px`
    div.style.height = `${el.size.height}px`
    div.style.zIndex = String(el.zIndex)
    div.style.opacity = String(el.opacity)

    if (el.type === 'text') {
      const t = el as TextElement
      div.style.fontSize = `${t.fontSize}px`
      div.style.fontFamily = t.fontFamily
      div.style.fontWeight = t.fontWeight
      div.style.fontStyle = t.fontStyle
      div.style.textDecoration = t.textDecoration
      div.style.textAlign = t.textAlign
      div.style.color = t.color
      div.style.backgroundColor = t.backgroundColor
      div.style.lineHeight = String(t.lineHeight)
      div.style.padding = `${t.padding}px`
      div.style.overflow = 'hidden'
      div.style.wordBreak = 'break-word'
      div.style.whiteSpace = 'pre-wrap'
      div.style.boxSizing = 'border-box'
      div.textContent = replaceVariables(t.content, data)
    } else if (el.type === 'shape') {
      const s = el as ShapeElement
      div.style.backgroundColor = s.fill
      if (s.strokeWidth > 0) {
        div.style.border = `${s.strokeWidth}px solid ${s.stroke}`
      }
      div.style.borderRadius = s.shape === 'circle' ? '50%' : `${s.borderRadius}px`
      div.style.boxSizing = 'border-box'
    } else if (el.type === 'image') {
      const img = el as ImageElement
      if (img.src) {
        const imgEl = document.createElement('img')
        imgEl.src = img.src
        imgEl.style.width = '100%'
        imgEl.style.height = '100%'
        imgEl.style.objectFit = img.objectFit
        imgEl.style.borderRadius = `${img.borderRadius}px`
        imgEl.crossOrigin = 'anonymous'
        div.appendChild(imgEl)
      }
    }

    container.appendChild(div)
  }

  return container
}

export async function generatePDF(
  template: Template,
  records: Record<string, string>[]
): Promise<void> {
  loadFontsForTemplate(template)
  await waitForFontsReady()

  const isLandscape = template.canvasWidth > template.canvasHeight
  const pdf = new jsPDF({
    orientation: isLandscape ? 'landscape' : 'portrait',
    unit: 'px',
    format: [template.canvasWidth, template.canvasHeight],
    hotfixes: ['px_scaling'],
  })

  for (let i = 0; i < records.length; i++) {
    if (i > 0) {
      pdf.addPage([template.canvasWidth, template.canvasHeight], isLandscape ? 'landscape' : 'portrait')
    }

    const container = renderPageToDOM(template, records[i]!)
    document.body.appendChild(container)

    await waitForFontsReady()
    await new Promise((r) => setTimeout(r, 100))

    const canvas = await html2canvas(container, {
      width: template.canvasWidth,
      height: template.canvasHeight,
      scale: 2,
      useCORS: true,
      backgroundColor: template.backgroundColor,
    })

    document.body.removeChild(container)

    const imgData = canvas.toDataURL('image/png')
    pdf.addImage(imgData, 'PNG', 0, 0, template.canvasWidth, template.canvasHeight)
  }

  pdf.save(`${template.name.replace(/\s+/g, '-').toLowerCase()}-merged.pdf`)
}
