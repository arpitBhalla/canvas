export interface Position {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export interface ShadowConfig {
  x: number
  y: number
  blur: number
  color: string
}

interface BaseElement {
  id: string
  type: 'text' | 'shape' | 'image' | 'path' | 'qr'
  position: Position
  size: Size
  rotation: number
  locked: boolean
  zIndex: number
  opacity: number
  name?: string
  visible?: boolean
  hideWhenEmpty?: string
  shadow?: ShadowConfig
  groupId?: string
}

export interface TextElement extends BaseElement {
  type: 'text'
  content: string
  fontSize: number
  fontFamily: string
  fontWeight: 'normal' | 'bold'
  fontStyle: 'normal' | 'italic'
  textDecoration: 'none' | 'underline' | 'line-through'
  textAlign: 'left' | 'center' | 'right'
  color: string
  backgroundColor: string
  lineHeight: number
  letterSpacing?: number
  padding: number
}

export type ShapeKind = 'rectangle' | 'circle' | 'triangle' | 'star' | 'line' | 'arrow'

export interface GradientConfig {
  from: string
  to: string
  angle: number
}

export interface ShapeElement extends BaseElement {
  type: 'shape'
  shape: ShapeKind
  fill: string
  stroke: string
  strokeWidth: number
  borderRadius: number
  gradient?: GradientConfig
}

export interface ImageFilters {
  brightness?: number
  contrast?: number
  saturate?: number
  blur?: number
}

export interface ImageCrop {
  x: number
  y: number
  width: number
  height: number
}

export interface ImageElement extends BaseElement {
  type: 'image'
  src: string
  objectFit: 'cover' | 'contain' | 'fill'
  borderRadius: number
  filters?: ImageFilters
  crop?: ImageCrop
  naturalWidth?: number
  naturalHeight?: number
}

export type QrErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H'

export interface QrElement extends BaseElement {
  type: 'qr'
  value: string
  level: QrErrorCorrectionLevel
  foreground: string
  background: string
  margin: number
}

export type PathMode = 'freehand' | 'curve' | 'straight'
export type ArrowEnd = 'none' | 'end' | 'both'

export interface PathElement extends BaseElement {
  type: 'path'
  mode: PathMode
  points: Position[]
  stroke: string
  strokeWidth: number
  closed?: boolean
  arrowhead?: ArrowEnd
}

export type CanvasElement = TextElement | ShapeElement | ImageElement | PathElement | QrElement

export interface Template {
  id: string
  name: string
  canvasWidth: number
  canvasHeight: number
  backgroundColor: string
  elements: CanvasElement[]
  brandColors?: string[]
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
  type: 'csv' | 'json' | 'api'
  records: Record<string, string>[]
  headers: string[]
  fileName?: string
  apiConfig?: {
    url: string
    path?: string
  }
}
