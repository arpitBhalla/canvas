import type { Position } from '../types'

export interface ShapePreset {
  id: string
  name: string
  category: 'badge' | 'ribbon' | 'callout' | 'arrow' | 'misc'
  width: number
  height: number
  points: Position[]
  closed: boolean
  defaultFill?: string
}

export const SHAPE_PRESETS: ShapePreset[] = [
  {
    id: 'starburst',
    name: 'Starburst',
    category: 'badge',
    width: 120,
    height: 120,
    closed: true,
    defaultFill: '#fbbf24',
    points: starburstPoints(60, 60, 56, 26, 12),
  },
  {
    id: 'circle-badge',
    name: 'Round badge',
    category: 'badge',
    width: 120,
    height: 120,
    closed: true,
    defaultFill: '#7c3aed',
    points: circlePoints(60, 60, 56, 32),
  },
  {
    id: 'shield',
    name: 'Shield',
    category: 'badge',
    width: 100,
    height: 130,
    closed: true,
    defaultFill: '#ef4444',
    points: [
      { x: 50, y: 4 },
      { x: 96, y: 24 },
      { x: 96, y: 76 },
      { x: 50, y: 126 },
      { x: 4, y: 76 },
      { x: 4, y: 24 },
    ],
  },
  {
    id: 'ribbon',
    name: 'Banner ribbon',
    category: 'ribbon',
    width: 240,
    height: 60,
    closed: true,
    defaultFill: '#0ea5e9',
    points: [
      { x: 0, y: 0 },
      { x: 220, y: 0 },
      { x: 240, y: 30 },
      { x: 220, y: 60 },
      { x: 0, y: 60 },
      { x: 20, y: 30 },
    ],
  },
  {
    id: 'tab',
    name: 'Tab',
    category: 'ribbon',
    width: 200,
    height: 56,
    closed: true,
    defaultFill: '#10b981',
    points: [
      { x: 0, y: 0 },
      { x: 200, y: 0 },
      { x: 180, y: 56 },
      { x: 20, y: 56 },
    ],
  },
  {
    id: 'speech-bubble',
    name: 'Speech bubble',
    category: 'callout',
    width: 200,
    height: 140,
    closed: true,
    defaultFill: '#fef3c7',
    points: [
      { x: 12, y: 0 },
      { x: 188, y: 0 },
      { x: 200, y: 12 },
      { x: 200, y: 100 },
      { x: 188, y: 112 },
      { x: 80, y: 112 },
      { x: 60, y: 140 },
      { x: 60, y: 112 },
      { x: 12, y: 112 },
      { x: 0, y: 100 },
      { x: 0, y: 12 },
    ],
  },
  {
    id: 'callout-tag',
    name: 'Tag',
    category: 'callout',
    width: 160,
    height: 60,
    closed: true,
    defaultFill: '#1f2937',
    points: [
      { x: 0, y: 30 },
      { x: 30, y: 0 },
      { x: 160, y: 0 },
      { x: 160, y: 60 },
      { x: 30, y: 60 },
    ],
  },
  {
    id: 'chevron-right',
    name: 'Chevron',
    category: 'arrow',
    width: 120,
    height: 60,
    closed: true,
    defaultFill: '#7c3aed',
    points: [
      { x: 0, y: 0 },
      { x: 90, y: 0 },
      { x: 120, y: 30 },
      { x: 90, y: 60 },
      { x: 0, y: 60 },
      { x: 30, y: 30 },
    ],
  },
  {
    id: 'arrow-right',
    name: 'Arrow',
    category: 'arrow',
    width: 160,
    height: 60,
    closed: true,
    defaultFill: '#0f172a',
    points: [
      { x: 0, y: 18 },
      { x: 100, y: 18 },
      { x: 100, y: 0 },
      { x: 160, y: 30 },
      { x: 100, y: 60 },
      { x: 100, y: 42 },
      { x: 0, y: 42 },
    ],
  },
  {
    id: 'heart',
    name: 'Heart',
    category: 'misc',
    width: 100,
    height: 90,
    closed: true,
    defaultFill: '#ec4899',
    points: heartPoints(50, 50, 44),
  },
  {
    id: 'cloud',
    name: 'Cloud',
    category: 'misc',
    width: 160,
    height: 80,
    closed: true,
    defaultFill: '#bae6fd',
    points: [
      { x: 30, y: 80 },
      { x: 14, y: 78 },
      { x: 0, y: 60 },
      { x: 8, y: 42 },
      { x: 24, y: 38 },
      { x: 30, y: 22 },
      { x: 56, y: 8 },
      { x: 88, y: 8 },
      { x: 116, y: 24 },
      { x: 134, y: 24 },
      { x: 156, y: 38 },
      { x: 160, y: 60 },
      { x: 144, y: 78 },
      { x: 130, y: 80 },
    ],
  },
]

function starburstPoints(cx: number, cy: number, outer: number, inner: number, spikes: number): Position[] {
  const points: Position[] = []
  const step = Math.PI / spikes
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outer : inner
    const a = -Math.PI / 2 + i * step
    points.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) })
  }
  return points
}

function circlePoints(cx: number, cy: number, r: number, segments: number): Position[] {
  const out: Position[] = []
  for (let i = 0; i < segments; i++) {
    const a = -Math.PI / 2 + (i / segments) * Math.PI * 2
    out.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) })
  }
  return out
}

function heartPoints(cx: number, cy: number, size: number): Position[] {
  const points: Position[] = []
  const steps = 32
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2
    const x = 16 * Math.pow(Math.sin(t), 3)
    const y =
      13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t)
    points.push({ x: cx + (x / 16) * size, y: cy - (y / 16) * size + 4 })
  }
  return points
}
