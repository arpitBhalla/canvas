import type { Position, PathMode, PathElement } from '../types'

export function pointsToD(points: Position[], mode: PathMode, closed = false): string {
  if (points.length === 0) return ''
  if (points.length === 1) return `M ${points[0]!.x} ${points[0]!.y}`

  if (mode === 'straight') {
    let d = `M ${points[0]!.x} ${points[0]!.y}`
    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i]!.x} ${points[i]!.y}`
    }
    if (closed) d += ' Z'
    return d
  }

  if (mode === 'curve' || mode === 'freehand') {
    let d = `M ${points[0]!.x} ${points[0]!.y}`
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i - 1] ?? points[i]!
      const p1 = points[i]!
      const p2 = points[i + 1]!
      const p3 = points[i + 2] ?? p2
      const c1x = p1.x + (p2.x - p0.x) / 6
      const c1y = p1.y + (p2.y - p0.y) / 6
      const c2x = p2.x - (p3.x - p1.x) / 6
      const c2y = p2.y - (p3.y - p1.y) / 6
      d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`
    }
    if (closed) d += ' Z'
    return d
  }

  return ''
}

export function simplifyFreehand(points: Position[], minDistance = 3): Position[] {
  if (points.length < 2) return points
  const out: Position[] = [points[0]!]
  for (let i = 1; i < points.length; i++) {
    const last = out[out.length - 1]!
    const dx = points[i]!.x - last.x
    const dy = points[i]!.y - last.y
    if (Math.sqrt(dx * dx + dy * dy) >= minDistance) {
      out.push(points[i]!)
    }
  }
  if (out[out.length - 1] !== points[points.length - 1]) {
    out.push(points[points.length - 1]!)
  }
  return out
}

export function bboxOfPoints(points: Position[]): { x: number; y: number; width: number; height: number } {
  if (points.length === 0) return { x: 0, y: 0, width: 0, height: 0 }
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const p of points) {
    if (p.x < minX) minX = p.x
    if (p.y < minY) minY = p.y
    if (p.x > maxX) maxX = p.x
    if (p.y > maxY) maxY = p.y
  }
  return { x: minX, y: minY, width: Math.max(1, maxX - minX), height: Math.max(1, maxY - minY) }
}

export function normalizePath(canvasPoints: Position[], strokeWidth: number) {
  const bbox = bboxOfPoints(canvasPoints)
  const pad = Math.ceil(strokeWidth / 2) + 4
  const x = bbox.x - pad
  const y = bbox.y - pad
  const width = bbox.width + pad * 2
  const height = bbox.height + pad * 2
  const localPoints = canvasPoints.map((p) => ({ x: p.x - x, y: p.y - y }))
  return {
    position: { x, y },
    size: { width, height },
    localPoints,
  }
}

export function denormalizePath(el: PathElement): Position[] {
  return el.points.map((p) => ({ x: p.x + el.position.x, y: p.y + el.position.y }))
}
