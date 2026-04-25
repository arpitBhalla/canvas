import type { ImageElement as ImageElementType } from '../../types'
import { isVariableToken, variableTokenName } from '../../utils/variables'
import { shadowToCss, imageFiltersToCss } from '../../utils/style'

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

  if (isVariableToken(element.src)) {
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
        filter: combinedFilter || undefined,
      }}
    />
  )
}
