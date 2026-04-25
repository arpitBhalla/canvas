import { useEffect, useMemo, useRef, useState } from 'react'
import { Rnd } from 'react-rnd'
import { X } from 'lucide-react'
import type { ImageElement, ImageCrop } from '../../types'
import { useEditorStore } from '../../store/editorStore'

interface Props {
  element: ImageElement
  onClose: () => void
}

const MAX_DISPLAY = 600

export default function CropModal({ element, onClose }: Props) {
  const updateElement = useEditorStore((s) => s.updateElement)
  const [imageDim, setImageDim] = useState<{ w: number; h: number } | null>(
    element.naturalWidth && element.naturalHeight
      ? { w: element.naturalWidth, h: element.naturalHeight }
      : null
  )

  useEffect(() => {
    if (imageDim) return
    const probe = new window.Image()
    probe.onload = () => setImageDim({ w: probe.naturalWidth, h: probe.naturalHeight })
    probe.src = element.src
  }, [element.src, imageDim])

  const scale = useMemo(() => {
    if (!imageDim) return 1
    return Math.min(1, MAX_DISPLAY / imageDim.w, MAX_DISPLAY / imageDim.h)
  }, [imageDim])

  const initial: ImageCrop = useMemo(() => {
    if (element.crop) return element.crop
    if (!imageDim) return { x: 0, y: 0, width: 100, height: 100 }
    const ratio = element.size.width / element.size.height
    let cropW = imageDim.w
    let cropH = imageDim.w / ratio
    if (cropH > imageDim.h) {
      cropH = imageDim.h
      cropW = imageDim.h * ratio
    }
    return {
      x: (imageDim.w - cropW) / 2,
      y: (imageDim.h - cropH) / 2,
      width: cropW,
      height: cropH,
    }
  }, [element.crop, element.size.width, element.size.height, imageDim])

  const [crop, setCrop] = useState<ImageCrop>(initial)
  const initialApplied = useRef(false)
  useEffect(() => {
    if (!initialApplied.current && imageDim) {
      setCrop(initial)
      initialApplied.current = true
    }
  }, [initial, imageDim])

  function commit() {
    if (!imageDim) return
    updateElement(element.id, {
      crop,
      naturalWidth: imageDim.w,
      naturalHeight: imageDim.h,
    })
    onClose()
  }

  function reset() {
    updateElement(element.id, { crop: undefined })
    onClose()
  }

  if (!imageDim) {
    return (
      <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50">
        <div className="text-white text-sm">Loading image…</div>
      </div>
    )
  }

  const dispW = imageDim.w * scale
  const dispH = imageDim.h * scale

  return (
    <div
      className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl p-5 max-w-3xl w-full"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900 tracking-tight">Crop image</h2>
            <p className="text-xs text-gray-500 mt-0.5">Drag the rectangle to choose the visible region.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div
          className="mx-auto relative bg-gray-100 select-none"
          style={{ width: dispW, height: dispH }}
        >
          <img
            src={element.src}
            alt=""
            draggable={false}
            style={{ width: dispW, height: dispH, opacity: 0.5, pointerEvents: 'none' }}
          />
          <Rnd
            bounds="parent"
            position={{ x: crop.x * scale, y: crop.y * scale }}
            size={{ width: crop.width * scale, height: crop.height * scale }}
            onDragStop={(_e, d) => {
              setCrop((c) => ({ ...c, x: d.x / scale, y: d.y / scale }))
            }}
            onResizeStop={(_e, _dir, ref, _delta, position) => {
              setCrop({
                x: position.x / scale,
                y: position.y / scale,
                width: parseInt(ref.style.width) / scale,
                height: parseInt(ref.style.height) / scale,
              })
            }}
            style={{
              border: '2px solid #7c3aed',
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.45)',
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `url(${element.src})`,
                backgroundSize: `${dispW}px ${dispH}px`,
                backgroundPosition: `-${crop.x * scale}px -${crop.y * scale}px`,
              }}
            />
          </Rnd>
        </div>

        <div className="grid grid-cols-4 gap-2 mt-4 text-xs">
          <CropField label="X" value={Math.round(crop.x)} onChange={(v) => setCrop((c) => ({ ...c, x: v }))} max={imageDim.w} />
          <CropField label="Y" value={Math.round(crop.y)} onChange={(v) => setCrop((c) => ({ ...c, y: v }))} max={imageDim.h} />
          <CropField label="W" value={Math.round(crop.width)} onChange={(v) => setCrop((c) => ({ ...c, width: v }))} max={imageDim.w} />
          <CropField label="H" value={Math.round(crop.height)} onChange={(v) => setCrop((c) => ({ ...c, height: v }))} max={imageDim.h} />
        </div>

        <div className="flex justify-between items-center mt-5">
          <button
            onClick={reset}
            disabled={!element.crop}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-md disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Remove crop
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={commit}
              className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800"
            >
              Apply crop
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function CropField({
  label,
  value,
  onChange,
  max,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  max: number
}) {
  return (
    <div>
      <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-0.5">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Math.max(0, Math.min(max, Number(e.target.value))))}
        className="w-full h-7 border border-gray-200 rounded px-2 text-xs focus:outline-none focus:border-violet-400"
      />
    </div>
  )
}
