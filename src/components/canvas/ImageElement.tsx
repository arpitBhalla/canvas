import type { ImageElement as ImageElementType } from '../../types'
import { isVariableToken, variableTokenName } from '../../utils/variables'
import { shadowToCss, imageFiltersToCss } from '../../utils/style'

interface Props {
  element: ImageElementType
  src?: string
}

export default function ImageElement({ element, src: overrideSrc }: Props) {
  const src = overrideSrc ?? element.src

  if (!src) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-sm border-2 border-dashed border-gray-300 rounded">
        No image
      </div>
    )
  }

  if (!overrideSrc && isVariableToken(element.src)) {
    const name = variableTokenName(element.src)
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-violet-50 text-violet-700 text-xs font-medium border-2 border-dashed border-violet-300 rounded gap-0.5">
        <span className="opacity-70">image variable</span>
        <span className="font-mono">{`{{${name}}}`}</span>
      </div>
    )
  }

  const shadow = shadowToCss(element.shadow)
  const filterCss = imageFiltersToCss(element.filters)
  const combinedFilter = [filterCss, shadow ? `drop-shadow(${shadow})` : null].filter(Boolean).join(' ')
  const radius = element.borderRadius

  if (element.crop && element.naturalWidth && element.naturalHeight) {
    const elW = element.size.width
    const elH = element.size.height
    const sx = elW / element.crop.width
    const sy = elH / element.crop.height
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          borderRadius: radius,
          position: 'relative',
        }}
      >
        <img
          src={src}
          alt=""
          draggable={false}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: element.naturalWidth * sx,
            height: element.naturalHeight * sy,
            transform: `translate(${-element.crop.x * sx}px, ${-element.crop.y * sy}px)`,
            filter: combinedFilter || undefined,
            maxWidth: 'none',
          }}
        />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt=""
      draggable={false}
      style={{
        width: '100%',
        height: '100%',
        objectFit: element.objectFit,
        borderRadius: radius,
        filter: combinedFilter || undefined,
      }}
    />
  )
}
