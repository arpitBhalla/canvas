export interface Position {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

interface BaseElement {
  id: string
  type: 'text' | 'shape' | 'image'
  position: Position
  size: Size
  rotation: number
  locked: boolean
  zIndex: number
  opacity: number
}

export interface TextElement extends BaseElement {
  type: 'text'
  content: string
  fontSize: number
  fontFamily: string
  fontWeight: 'normal' | 'bold'
  fontStyle: 'normal' | 'italic'
  textDecoration: 'none' | 'underline'
  textAlign: 'left' | 'center' | 'right'
  color: string
  backgroundColor: string
  lineHeight: number
  padding: number
}

export interface ShapeElement extends BaseElement {
  type: 'shape'
  shape: 'rectangle' | 'circle'
  fill: string
  stroke: string
  strokeWidth: number
  borderRadius: number
}

export interface ImageElement extends BaseElement {
  type: 'image'
  src: string
  objectFit: 'cover' | 'contain' | 'fill'
  borderRadius: number
}

export type CanvasElement = TextElement | ShapeElement | ImageElement

export interface Template {
  id: string
  name: string
  canvasWidth: number
  canvasHeight: number
  backgroundColor: string
  elements: CanvasElement[]
}

export interface Project {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  template: Template
}

export interface Variable {
  name: string
  label: string
  placeholder: string
  category: 'contact' | 'company' | 'custom'
}

export interface DataSource {
  type: 'csv' | 'json'
  records: Record<string, string>[]
  headers: string[]
  fileName?: string
}
