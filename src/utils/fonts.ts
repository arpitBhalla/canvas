import type { Template } from '../types'
import { findFont } from '../constants/googleFonts'

const loaded = new Set<string>()

function familyToParam(family: string): string {
  return family.replace(/\s+/g, '+')
}

export function loadGoogleFont(family: string, weights?: number[]): void {
  if (typeof document === 'undefined') return
  const bare = family.replace(/['"]/g, '').split(',')[0]?.trim()
  if (!bare || loaded.has(bare)) return

  const font = findFont(bare)
  const ws = (weights && weights.length > 0 ? weights : font?.weights) ?? [400, 700]
  const sortedWeights = [...new Set(ws)].sort((a, b) => a - b)

  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?family=${familyToParam(bare)}:wght@${sortedWeights.join(';')}&display=swap`
  link.dataset.googleFont = bare
  document.head.appendChild(link)
  loaded.add(bare)
}

export function loadFontsForTemplate(template: Template): void {
  for (const el of template.elements) {
    if (el.type === 'text') {
      loadGoogleFont(el.fontFamily)
    }
  }
}

export async function waitForFontsReady(): Promise<void> {
  if (typeof document === 'undefined') return
  const fonts = (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts
  if (fonts?.ready) {
    try {
      await fonts.ready
    } catch {
      // ignore; rendering will fall back to system fonts
    }
  }
}
