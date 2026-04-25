import QRCode from 'qrcode'
import type { QrElement } from '../types'

const SVG_NS = 'http://www.w3.org/2000/svg'

interface QrParts {
  modules: boolean[][]
  size: number
}

const cache = new Map<string, QrParts>()

function key(value: string, level: QrElement['level']) {
  return `${level}::${value}`
}

export function buildQr(value: string, level: QrElement['level']): QrParts {
  const k = key(value, level)
  const hit = cache.get(k)
  if (hit) return hit
  const safeValue = value.length === 0 ? ' ' : value
  const data = QRCode.create(safeValue, { errorCorrectionLevel: level })
  const modules: boolean[][] = []
  const size = data.modules.size
  const flat = data.modules.data as Uint8Array
  for (let row = 0; row < size; row++) {
    const r: boolean[] = []
    for (let col = 0; col < size; col++) {
      r.push(flat[row * size + col] === 1)
    }
    modules.push(r)
  }
  const parts: QrParts = { modules, size }
  cache.set(k, parts)
  return parts
}

export function buildQrSvgElement(el: QrElement, value?: string): SVGSVGElement {
  const text = value ?? el.value
  const parts = buildQr(text, el.level)
  const margin = el.margin
  const total = parts.size + margin * 2

  const svg = document.createElementNS(SVG_NS, 'svg')
  svg.setAttribute('viewBox', `0 0 ${total} ${total}`)
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet')
  svg.setAttribute('width', '100%')
  svg.setAttribute('height', '100%')
  svg.style.shapeRendering = 'crispEdges'

  const bg = document.createElementNS(SVG_NS, 'rect')
  bg.setAttribute('width', String(total))
  bg.setAttribute('height', String(total))
  bg.setAttribute('fill', el.background)
  svg.appendChild(bg)

  let path = ''
  for (let row = 0; row < parts.size; row++) {
    for (let col = 0; col < parts.size; col++) {
      if (parts.modules[row]![col]) {
        path += `M${col + margin} ${row + margin}h1v1h-1z`
      }
    }
  }
  if (path) {
    const p = document.createElementNS(SVG_NS, 'path')
    p.setAttribute('d', path)
    p.setAttribute('fill', el.foreground)
    svg.appendChild(p)
  }
  return svg
}
