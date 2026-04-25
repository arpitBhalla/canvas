import type { TextElement, ShapeElement, ImageElement } from '../types'

type DefaultText = Omit<TextElement, 'id' | 'zIndex'>
type DefaultShape = Omit<ShapeElement, 'id' | 'zIndex'>
type DefaultImage = Omit<ImageElement, 'id' | 'zIndex'>

export const DEFAULT_TEXT: DefaultText = {
  type: 'text',
  position: { x: 50, y: 50 },
  size: { width: 250, height: 60 },
  rotation: 0,
  locked: false,
  opacity: 1,
  content: 'Double-click to edit',
  fontSize: 16,
  fontFamily: "'Inter', sans-serif",
  fontWeight: 'normal',
  fontStyle: 'normal',
  textDecoration: 'none',
  textAlign: 'left',
  color: '#1a1a1a',
  backgroundColor: 'transparent',
  lineHeight: 1.5,
  padding: 8,
}

export const DEFAULT_SHAPE: DefaultShape = {
  type: 'shape',
  position: { x: 50, y: 50 },
  size: { width: 150, height: 150 },
  rotation: 0,
  locked: false,
  opacity: 1,
  shape: 'rectangle',
  fill: '#3b82f6',
  stroke: 'transparent',
  strokeWidth: 0,
  borderRadius: 8,
}

export const DEFAULT_IMAGE: DefaultImage = {
  type: 'image',
  position: { x: 50, y: 50 },
  size: { width: 200, height: 200 },
  rotation: 0,
  locked: false,
  opacity: 1,
  src: '',
  objectFit: 'cover',
  borderRadius: 0,
}

export const CANVAS_WIDTH = 1200
export const CANVAS_HEIGHT = 900
