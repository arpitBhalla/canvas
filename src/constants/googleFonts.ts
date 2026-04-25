export type FontCategory = 'sans-serif' | 'serif' | 'display' | 'handwriting' | 'monospace'

export interface GoogleFont {
  family: string
  category: FontCategory
  weights: number[]
}

export const GOOGLE_FONTS: GoogleFont[] = [
  { family: 'Inter', category: 'sans-serif', weights: [400, 500, 600, 700] },
  { family: 'Roboto', category: 'sans-serif', weights: [400, 500, 700] },
  { family: 'Open Sans', category: 'sans-serif', weights: [400, 600, 700] },
  { family: 'Lato', category: 'sans-serif', weights: [400, 700] },
  { family: 'Montserrat', category: 'sans-serif', weights: [400, 500, 600, 700] },
  { family: 'Poppins', category: 'sans-serif', weights: [400, 500, 600, 700] },
  { family: 'Raleway', category: 'sans-serif', weights: [400, 500, 600, 700] },
  { family: 'Nunito', category: 'sans-serif', weights: [400, 600, 700] },
  { family: 'Nunito Sans', category: 'sans-serif', weights: [400, 600, 700] },
  { family: 'Work Sans', category: 'sans-serif', weights: [400, 500, 600, 700] },
  { family: 'Source Sans 3', category: 'sans-serif', weights: [400, 600, 700] },
  { family: 'Rubik', category: 'sans-serif', weights: [400, 500, 700] },
  { family: 'DM Sans', category: 'sans-serif', weights: [400, 500, 700] },
  { family: 'Manrope', category: 'sans-serif', weights: [400, 500, 600, 700] },
  { family: 'Plus Jakarta Sans', category: 'sans-serif', weights: [400, 500, 600, 700] },
  { family: 'Outfit', category: 'sans-serif', weights: [400, 500, 600, 700] },
  { family: 'Oswald', category: 'sans-serif', weights: [400, 500, 700] },
  { family: 'Bebas Neue', category: 'display', weights: [400] },
  { family: 'Anton', category: 'sans-serif', weights: [400] },
  { family: 'Archivo', category: 'sans-serif', weights: [400, 500, 600, 700] },
  { family: 'Karla', category: 'sans-serif', weights: [400, 500, 700] },
  { family: 'Mulish', category: 'sans-serif', weights: [400, 600, 700] },
  { family: 'Quicksand', category: 'sans-serif', weights: [400, 500, 600, 700] },
  { family: 'Playfair Display', category: 'serif', weights: [400, 600, 700] },
  { family: 'Merriweather', category: 'serif', weights: [400, 700] },
  { family: 'Lora', category: 'serif', weights: [400, 500, 600, 700] },
  { family: 'PT Serif', category: 'serif', weights: [400, 700] },
  { family: 'Source Serif 4', category: 'serif', weights: [400, 600, 700] },
  { family: 'EB Garamond', category: 'serif', weights: [400, 500, 700] },
  { family: 'Crimson Text', category: 'serif', weights: [400, 600, 700] },
  { family: 'Cormorant Garamond', category: 'serif', weights: [400, 500, 700] },
  { family: 'Libre Baskerville', category: 'serif', weights: [400, 700] },
  { family: 'Bitter', category: 'serif', weights: [400, 600, 700] },
  { family: 'Pacifico', category: 'handwriting', weights: [400] },
  { family: 'Dancing Script', category: 'handwriting', weights: [400, 600, 700] },
  { family: 'Caveat', category: 'handwriting', weights: [400, 600, 700] },
  { family: 'Great Vibes', category: 'handwriting', weights: [400] },
  { family: 'Sacramento', category: 'handwriting', weights: [400] },
  { family: 'Lobster', category: 'display', weights: [400] },
  { family: 'Abril Fatface', category: 'display', weights: [400] },
  { family: 'Righteous', category: 'display', weights: [400] },
  { family: 'JetBrains Mono', category: 'monospace', weights: [400, 500, 700] },
  { family: 'Fira Code', category: 'monospace', weights: [400, 500, 700] },
  { family: 'Source Code Pro', category: 'monospace', weights: [400, 600, 700] },
  { family: 'IBM Plex Mono', category: 'monospace', weights: [400, 500, 700] },
]

export function fontFamilyStack(family: string, category?: FontCategory): string {
  const fallback =
    category === 'serif'
      ? 'serif'
      : category === 'monospace'
      ? 'monospace'
      : category === 'handwriting' || category === 'display'
      ? 'cursive'
      : 'sans-serif'
  return `'${family}', ${fallback}`
}

export function findFont(family: string): GoogleFont | undefined {
  const bare = family.replace(/['"]/g, '').split(',')[0]?.trim()
  if (!bare) return undefined
  return GOOGLE_FONTS.find((f) => f.family === bare)
}
