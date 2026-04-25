import type { ShadowConfig, ImageFilters, GradientConfig, ShapeElement } from '../types'

export function shadowToCss(shadow: ShadowConfig | undefined): string | undefined {
  if (!shadow) return undefined
  return `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.color}`
}

export function imageFiltersToCss(filters: ImageFilters | undefined): string | undefined {
  if (!filters) return undefined
  const parts: string[] = []
  if (filters.brightness !== undefined && filters.brightness !== 100) parts.push(`brightness(${filters.brightness}%)`)
  if (filters.contrast !== undefined && filters.contrast !== 100) parts.push(`contrast(${filters.contrast}%)`)
  if (filters.saturate !== undefined && filters.saturate !== 100) parts.push(`saturate(${filters.saturate}%)`)
  if (filters.blur !== undefined && filters.blur > 0) parts.push(`blur(${filters.blur}px)`)
  return parts.length ? parts.join(' ') : undefined
}

export function gradientToCss(g: GradientConfig | undefined): string | undefined {
  if (!g) return undefined
  return `linear-gradient(${g.angle}deg, ${g.from}, ${g.to})`
}

export function shapeFillCss(el: ShapeElement): { backgroundColor?: string; backgroundImage?: string } {
  if (el.gradient) return { backgroundImage: gradientToCss(el.gradient) }
  return { backgroundColor: el.fill }
}
