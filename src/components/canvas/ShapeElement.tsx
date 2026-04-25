import type { ShapeElement as ShapeElementType } from '../../types'

interface Props {
  element: ShapeElementType
}

export default function ShapeElement({ element }: Props) {
  const style: React.CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor: element.fill,
    border: element.strokeWidth > 0 ? `${element.strokeWidth}px solid ${element.stroke}` : 'none',
    borderRadius: element.shape === 'circle' ? '50%' : element.borderRadius,
  }

  return <div style={style} />
}
