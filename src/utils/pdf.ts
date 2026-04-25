import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import type { Template, TextElement, ShapeElement, ImageElement, PathElement } from '../types'
import { replaceVariables, shouldHideForRecord, isVariableToken, variableTokenName } from './variables'
import { loadFontsForTemplate, waitForFontsReady } from './fonts'
import { shadowToCss, imageFiltersToCss, gradientToCss } from './style'
import { pointsToD } from './path'

const SVG_NS = 'http://www.w3.org/2000/svg'

function buildLineSvg(s: ShapeElement): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg')
  svg.setAttribute('viewBox', `0 0 ${s.size.width} ${s.size.height}`)
  svg.setAttribute('preserveAspectRatio', 'none')
  svg.style.overflow = 'visible'
  svg.style.width = '100%'
  svg.style.height = '100%'

  const stroke = s.stroke && s.stroke !== 'transparent' ? s.stroke : s.fill
  const sw = Math.max(1, s.strokeWidth || 2)

  if (s.shape === 'arrow') {
    const defs = document.createElementNS(SVG_NS, 'defs')
    const marker = document.createElementNS(SVG_NS, 'marker')
    const markerId = `m-${s.id}`
    marker.setAttribute('id', markerId)
    marker.setAttribute('viewBox', '0 0 10 10')
    marker.setAttribute('refX', '8')
    marker.setAttribute('refY', '5')
    marker.setAttribute('markerWidth', '5')
    marker.setAttribute('markerHeight', '5')
    marker.setAttribute('markerUnits', 'strokeWidth')
    marker.setAttribute('orient', 'auto-start-reverse')
    const tri = document.createElementNS(SVG_NS, 'path')
    tri.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z')
    tri.setAttribute('fill', stroke)
    marker.appendChild(tri)
    defs.appendChild(marker)
    svg.appendChild(defs)
  }

  const line = document.createElementNS(SVG_NS, 'line')
  line.setAttribute('x1', String(sw / 2))
  line.setAttribute('y1', String(s.size.height / 2))
  line.setAttribute('x2', String(s.size.width - sw / 2))
  line.setAttribute('y2', String(s.size.height / 2))
  line.setAttribute('stroke', stroke)
  line.setAttribute('stroke-width', String(sw))
  line.setAttribute('stroke-linecap', 'round')
  if (s.shape === 'arrow') line.setAttribute('marker-end', `url(#m-${s.id})`)
  svg.appendChild(line)
  return svg
}

function buildPathSvg(p: PathElement): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg')
  svg.setAttribute('viewBox', `0 0 ${p.size.width} ${p.size.height}`)
  svg.setAttribute('preserveAspectRatio', 'none')
  svg.style.overflow = 'visible'
  svg.style.width = '100%'
  svg.style.height = '100%'

  const showArrow = p.arrowhead && p.arrowhead !== 'none'
  if (showArrow) {
    const defs = document.createElementNS(SVG_NS, 'defs')
    const marker = document.createElementNS(SVG_NS, 'marker')
    const markerId = `pm-${p.id}`
    marker.setAttribute('id', markerId)
    marker.setAttribute('viewBox', '0 0 10 10')
    marker.setAttribute('refX', '9')
    marker.setAttribute('refY', '5')
    marker.setAttribute('markerWidth', '4')
    marker.setAttribute('markerHeight', '4')
    marker.setAttribute('markerUnits', 'strokeWidth')
    marker.setAttribute('orient', 'auto-start-reverse')
    const tri = document.createElementNS(SVG_NS, 'path')
    tri.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z')
    tri.setAttribute('fill', p.stroke)
    marker.appendChild(tri)
    defs.appendChild(marker)
    svg.appendChild(defs)
  }

  const path = document.createElementNS(SVG_NS, 'path')
  path.setAttribute('d', pointsToD(p.points, p.mode, p.closed))
  path.setAttribute('fill', p.closed ? p.stroke : 'none')
  if (p.closed) path.setAttribute('fill-opacity', '0.1')
  path.setAttribute('stroke', p.stroke)
  path.setAttribute('stroke-width', String(p.strokeWidth))
  path.setAttribute('stroke-linecap', 'round')
  path.setAttribute('stroke-linejoin', 'round')
  if (showArrow && (p.arrowhead === 'end' || p.arrowhead === 'both')) {
    path.setAttribute('marker-end', `url(#pm-${p.id})`)
  }
  if (showArrow && p.arrowhead === 'both') {
    path.setAttribute('marker-start', `url(#pm-${p.id})`)
  }
  svg.appendChild(path)
  return svg
}

export function renderPageToDOM(
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

  const sorted = [...template.elements]
    .sort((a, b) => a.zIndex - b.zIndex)
    .filter((el) => el.visible !== false && !shouldHideForRecord(el.hideWhenEmpty, data))

  for (const el of sorted) {
    const wrap = document.createElement('div')
    wrap.style.position = 'absolute'
    wrap.style.left = `${el.position.x}px`
    wrap.style.top = `${el.position.y}px`
    wrap.style.width = `${el.size.width}px`
    wrap.style.height = `${el.size.height}px`
    wrap.style.zIndex = String(el.zIndex)
    wrap.style.opacity = String(el.opacity)

    if (el.type === 'text') {
      const t = el as TextElement
      wrap.style.fontSize = `${t.fontSize}px`
      wrap.style.fontFamily = t.fontFamily
      wrap.style.fontWeight = t.fontWeight
      wrap.style.fontStyle = t.fontStyle
      wrap.style.textDecoration = t.textDecoration
      wrap.style.textAlign = t.textAlign
      wrap.style.color = t.color
      wrap.style.backgroundColor = t.backgroundColor
      wrap.style.lineHeight = String(t.lineHeight)
      if (t.letterSpacing != null) wrap.style.letterSpacing = `${t.letterSpacing}px`
      wrap.style.padding = `${t.padding}px`
      const ts = shadowToCss(t.shadow)
      if (ts) wrap.style.textShadow = ts
      wrap.style.overflow = 'hidden'
      wrap.style.wordBreak = 'break-word'
      wrap.style.whiteSpace = 'pre-wrap'
      wrap.style.boxSizing = 'border-box'
      wrap.textContent = replaceVariables(t.content, data)
    } else if (el.type === 'shape') {
      const s = el as ShapeElement
      if (s.shape === 'line' || s.shape === 'arrow') {
        wrap.appendChild(buildLineSvg(s))
        const sh = shadowToCss(s.shadow)
        if (sh) wrap.style.filter = `drop-shadow(${sh})`
      } else {
        if (s.gradient) {
          const grad = gradientToCss(s.gradient)
          if (grad) wrap.style.backgroundImage = grad
        } else {
          wrap.style.backgroundColor = s.fill
        }
        let radius: string = `${s.borderRadius}px`
        if (s.shape === 'circle') radius = '50%'
        else if (s.shape === 'triangle') {
          wrap.style.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)'
          radius = '0'
        } else if (s.shape === 'star') {
          wrap.style.clipPath =
            'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
          radius = '0'
        }
        wrap.style.borderRadius = radius
        const usesClip = s.shape === 'triangle' || s.shape === 'star'
        if (!usesClip && s.strokeWidth > 0) {
          wrap.style.border = `${s.strokeWidth}px solid ${s.stroke}`
        }
        wrap.style.boxSizing = 'border-box'
        const sh = shadowToCss(s.shadow)
        if (sh) {
          if (usesClip) wrap.style.filter = `drop-shadow(${sh})`
          else wrap.style.boxShadow = sh
        }
      }
    } else if (el.type === 'image') {
      const img = el as ImageElement
      let src = img.src
      if (isVariableToken(src)) {
        const name = variableTokenName(src)
        src = name ? data[name] ?? '' : ''
      }
      if (src) {
        const imgEl = document.createElement('img')
        imgEl.src = src
        imgEl.style.width = '100%'
        imgEl.style.height = '100%'
        imgEl.style.objectFit = img.objectFit
        imgEl.style.borderRadius = `${img.borderRadius}px`
        imgEl.crossOrigin = 'anonymous'
        const filterCss = imageFiltersToCss(img.filters)
        const sh = shadowToCss(img.shadow)
        const combined = [filterCss, sh ? `drop-shadow(${sh})` : null].filter(Boolean).join(' ')
        if (combined) imgEl.style.filter = combined
        wrap.appendChild(imgEl)
      }
    } else if (el.type === 'path') {
      const p = el as PathElement
      wrap.appendChild(buildPathSvg(p))
      const sh = shadowToCss(p.shadow)
      if (sh) wrap.style.filter = `drop-shadow(${sh})`
    }

    container.appendChild(wrap)
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
