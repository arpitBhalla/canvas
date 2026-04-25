import type { Template, CanvasElement, TextElement, ShapeElement } from '../types'
import { createId } from '../utils/ids'

interface BuiltinTemplate {
  id: string
  name: string
  category: 'invoice' | 'certificate' | 'card' | 'social'
  width: number
  height: number
  build: () => Omit<Template, 'id' | 'name'>
}

function blank(width: number, height: number, bg = '#ffffff'): Omit<Template, 'id' | 'name' | 'elements'> & { elements: CanvasElement[] } {
  return {
    canvasWidth: width,
    canvasHeight: height,
    backgroundColor: bg,
    elements: [],
  }
}

function makeText(over: Partial<TextElement>): TextElement {
  return {
    id: createId(),
    type: 'text',
    position: { x: 50, y: 50 },
    size: { width: 300, height: 60 },
    rotation: 0,
    locked: false,
    opacity: 1,
    zIndex: 1,
    content: 'Text',
    fontSize: 24,
    fontFamily: "'Inter', sans-serif",
    fontWeight: 'normal',
    fontStyle: 'normal',
    textDecoration: 'none',
    textAlign: 'left',
    color: '#111827',
    backgroundColor: 'transparent',
    lineHeight: 1.4,
    padding: 8,
    ...over,
  } as TextElement
}

function makeShape(over: Partial<ShapeElement>): ShapeElement {
  return {
    id: createId(),
    type: 'shape',
    position: { x: 0, y: 0 },
    size: { width: 100, height: 100 },
    rotation: 0,
    locked: false,
    opacity: 1,
    zIndex: 1,
    shape: 'rectangle',
    fill: '#7c3aed',
    stroke: 'transparent',
    strokeWidth: 0,
    borderRadius: 8,
    ...over,
  } as ShapeElement
}

export const BUILTIN_TEMPLATES: BuiltinTemplate[] = [
  {
    id: 'invoice',
    name: 'Invoice',
    category: 'invoice',
    width: 794,
    height: 1123,
    build: () => {
      const t = blank(794, 1123)
      t.elements.push(
        makeShape({ position: { x: 0, y: 0 }, size: { width: 794, height: 130 }, fill: '#111827', borderRadius: 0, zIndex: 1 }),
        makeText({
          position: { x: 48, y: 38 },
          size: { width: 400, height: 48 },
          content: 'INVOICE',
          fontSize: 36,
          fontWeight: 'bold',
          color: '#ffffff',
          zIndex: 2,
        }),
        makeText({
          position: { x: 48, y: 84 },
          size: { width: 400, height: 28 },
          content: '{{invoiceNumber}}',
          fontSize: 14,
          color: '#a1a1aa',
          zIndex: 3,
        }),
        makeText({
          position: { x: 48, y: 180 },
          size: { width: 320, height: 24 },
          content: 'Bill to',
          fontSize: 11,
          color: '#6b7280',
          zIndex: 4,
        }),
        makeText({
          position: { x: 48, y: 206 },
          size: { width: 320, height: 32 },
          content: '{{customerName}}',
          fontSize: 18,
          fontWeight: 'bold',
          color: '#111827',
          zIndex: 5,
        }),
        makeText({
          position: { x: 48, y: 240 },
          size: { width: 320, height: 24 },
          content: '{{customerEmail}}',
          fontSize: 13,
          color: '#4b5563',
          zIndex: 6,
        }),
        makeText({
          position: { x: 480, y: 180 },
          size: { width: 270, height: 24 },
          content: 'Issued',
          fontSize: 11,
          color: '#6b7280',
          textAlign: 'right',
          zIndex: 7,
        }),
        makeText({
          position: { x: 480, y: 206 },
          size: { width: 270, height: 28 },
          content: '{{issueDate}}',
          fontSize: 14,
          color: '#111827',
          textAlign: 'right',
          zIndex: 8,
        }),
        makeShape({ position: { x: 48, y: 360 }, size: { width: 698, height: 1 }, fill: '#e5e7eb', borderRadius: 0, zIndex: 9 }),
        makeText({
          position: { x: 48, y: 380 },
          size: { width: 320, height: 24 },
          content: '{{itemDescription}}',
          fontSize: 14,
          color: '#111827',
          zIndex: 10,
        }),
        makeText({
          position: { x: 480, y: 380 },
          size: { width: 270, height: 24 },
          content: '{{amount}}',
          fontSize: 14,
          fontWeight: 'bold',
          color: '#111827',
          textAlign: 'right',
          zIndex: 11,
        }),
        makeShape({
          position: { x: 48, y: 460 },
          size: { width: 698, height: 80 },
          fill: '#f3f4f6',
          borderRadius: 12,
          zIndex: 12,
        }),
        makeText({
          position: { x: 72, y: 484 },
          size: { width: 200, height: 32 },
          content: 'Total due',
          fontSize: 14,
          color: '#6b7280',
          zIndex: 13,
        }),
        makeText({
          position: { x: 480, y: 478 },
          size: { width: 246, height: 44 },
          content: '{{total}}',
          fontSize: 28,
          fontWeight: 'bold',
          color: '#111827',
          textAlign: 'right',
          zIndex: 14,
        }),
      )
      return t
    },
  },
  {
    id: 'certificate',
    name: 'Certificate',
    category: 'certificate',
    width: 1123,
    height: 794,
    build: () => {
      const t = blank(1123, 794, '#fbf9f4')
      t.elements.push(
        makeShape({
          position: { x: 30, y: 30 },
          size: { width: 1063, height: 734 },
          fill: 'transparent',
          stroke: '#854d0e',
          strokeWidth: 2,
          borderRadius: 0,
          zIndex: 1,
        }),
        makeShape({
          position: { x: 50, y: 50 },
          size: { width: 1023, height: 694 },
          fill: 'transparent',
          stroke: '#ca8a04',
          strokeWidth: 1,
          borderRadius: 0,
          zIndex: 2,
        }),
        makeText({
          position: { x: 100, y: 130 },
          size: { width: 923, height: 40 },
          content: 'Certificate of Achievement',
          fontSize: 18,
          color: '#854d0e',
          textAlign: 'center',
          zIndex: 3,
          fontFamily: "'Cormorant Garamond', serif",
        }),
        makeText({
          position: { x: 100, y: 220 },
          size: { width: 923, height: 80 },
          content: 'This is to certify that',
          fontSize: 24,
          color: '#6b7280',
          textAlign: 'center',
          zIndex: 4,
          fontStyle: 'italic',
        }),
        makeText({
          position: { x: 100, y: 320 },
          size: { width: 923, height: 80 },
          content: '{{recipientName}}',
          fontSize: 56,
          fontWeight: 'bold',
          color: '#111827',
          textAlign: 'center',
          zIndex: 5,
          fontFamily: "'Playfair Display', serif",
        }),
        makeText({
          position: { x: 160, y: 440 },
          size: { width: 803, height: 80 },
          content: 'has successfully completed {{courseName}} on {{completionDate}}',
          fontSize: 18,
          color: '#374151',
          textAlign: 'center',
          lineHeight: 1.6,
          zIndex: 6,
        }),
        makeShape({
          position: { x: 481, y: 580 },
          size: { width: 160, height: 1 },
          fill: '#854d0e',
          borderRadius: 0,
          zIndex: 7,
        }),
        makeText({
          position: { x: 421, y: 595 },
          size: { width: 280, height: 28 },
          content: '{{signatory}}',
          fontSize: 14,
          color: '#374151',
          textAlign: 'center',
          zIndex: 8,
        }),
      )
      return t
    },
  },
  {
    id: 'business-card',
    name: 'Business card',
    category: 'card',
    width: 1050,
    height: 600,
    build: () => {
      const t = blank(1050, 600, '#0f172a')
      t.elements.push(
        makeShape({
          position: { x: 0, y: 0 },
          size: { width: 12, height: 600 },
          fill: '#7c3aed',
          borderRadius: 0,
          zIndex: 1,
        }),
        makeText({
          position: { x: 60, y: 80 },
          size: { width: 600, height: 60 },
          content: '{{fullName}}',
          fontSize: 42,
          fontWeight: 'bold',
          color: '#f9fafb',
          zIndex: 2,
        }),
        makeText({
          position: { x: 60, y: 148 },
          size: { width: 600, height: 36 },
          content: '{{jobTitle}}',
          fontSize: 20,
          color: '#a78bfa',
          zIndex: 3,
        }),
        makeShape({
          position: { x: 60, y: 220 },
          size: { width: 80, height: 2 },
          fill: '#7c3aed',
          borderRadius: 0,
          zIndex: 4,
        }),
        makeText({
          position: { x: 60, y: 260 },
          size: { width: 600, height: 32 },
          content: '{{email}}',
          fontSize: 16,
          color: '#cbd5e1',
          zIndex: 5,
        }),
        makeText({
          position: { x: 60, y: 300 },
          size: { width: 600, height: 32 },
          content: '{{phone}}',
          fontSize: 16,
          color: '#cbd5e1',
          zIndex: 6,
        }),
        makeText({
          position: { x: 60, y: 340 },
          size: { width: 600, height: 32 },
          content: '{{website}}',
          fontSize: 16,
          color: '#cbd5e1',
          zIndex: 7,
        }),
      )
      return t
    },
  },
  {
    id: 'social-square',
    name: 'Social post',
    category: 'social',
    width: 1080,
    height: 1080,
    build: () => {
      const t = blank(1080, 1080, '#fef3c7')
      t.elements.push(
        makeShape({
          position: { x: 0, y: 0 },
          size: { width: 1080, height: 1080 },
          fill: '#fef3c7',
          gradient: { from: '#fef3c7', to: '#fde68a', angle: 135 },
          borderRadius: 0,
          zIndex: 1,
        }),
        makeShape({
          position: { x: 80, y: 80 },
          size: { width: 920, height: 920 },
          fill: 'transparent',
          stroke: '#92400e',
          strokeWidth: 4,
          borderRadius: 0,
          zIndex: 2,
        }),
        makeText({
          position: { x: 100, y: 380 },
          size: { width: 880, height: 80 },
          content: 'Now Available',
          fontSize: 28,
          color: '#92400e',
          textAlign: 'center',
          zIndex: 3,
          fontWeight: 'bold',
        }),
        makeText({
          position: { x: 100, y: 460 },
          size: { width: 880, height: 200 },
          content: '{{headline}}',
          fontSize: 84,
          fontWeight: 'bold',
          color: '#1f2937',
          textAlign: 'center',
          lineHeight: 1.1,
          zIndex: 4,
          fontFamily: "'Playfair Display', serif",
        }),
        makeText({
          position: { x: 200, y: 700 },
          size: { width: 680, height: 80 },
          content: '{{tagline}}',
          fontSize: 22,
          color: '#78350f',
          textAlign: 'center',
          fontStyle: 'italic',
          zIndex: 5,
        }),
      )
      return t
    },
  },
]

export function buildBuiltinTemplate(id: string): Omit<Template, 'id' | 'name'> | null {
  const tpl = BUILTIN_TEMPLATES.find((t) => t.id === id)
  return tpl ? tpl.build() : null
}
