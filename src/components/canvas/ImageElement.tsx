import type { ImageElement as ImageElementType } from '../../types'

interface Props {
  element: ImageElementType
}

export default function ImageElement({ element }: Props) {
  if (!element.src) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-sm border-2 border-dashed border-gray-300 rounded">
        No image
      </div>
    )
  }

  return (
    <img
      src={element.src}
      alt=""
      draggable={false}
      style={{
        width: '100%',
        height: '100%',
        objectFit: element.objectFit,
        borderRadius: element.borderRadius,
      }}
    />
  )
}
