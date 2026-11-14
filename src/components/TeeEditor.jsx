import { useEffect, useRef, useState } from 'react'
import { Canvas, FabricImage, Path, Rect } from 'fabric'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../cart'

// The mockup is drawn in a fixed 500 x 600 space and zoomed to fit the screen
const W = 500
const H = 600
const TEE_PATH =
  'M190 60 Q250 110 310 60 L400 90 L480 190 L420 240 L385 200 L385 560 L115 560 L115 200 L80 240 L20 190 L100 90 Z'
// Where the design can be printed; anything outside it is cut off
const PRINT = { left: 150, top: 150, width: 200, height: 280 }
const MIN_PRINT_PX = 800
const MAX_ARTWORK_PX = 1600 // artwork is shrunk to this before it goes in the cart

const COLORS = [
  { name: 'White', hex: '#ffffff' },
  { name: 'Cream', hex: '#efe6cf' },
  { name: 'Black', hex: '#1a1a1a' },
  { name: 'Brown', hex: '#5b4032' },
  { name: 'Green', hex: '#1f4d3a' },
]
const SIZES = ['S', 'M', 'L', 'XL', 'XXL']

const fixed = { selectable: false, evented: false }
const toolClass =
  'rounded-lg border-2 border-neutral-200 px-3 py-2 text-sm font-semibold transition hover:border-brand disabled:opacity-40 disabled:hover:border-neutral-200'

export default function TeeEditor({ images, onBack }) {
  const holderRef = useRef(null)
  const fabricRef = useRef(null) // { canvas, tee, guide, addImage }
  const [color, setColor] = useState(COLORS[0])
  const [size, setSize] = useState(null)
  const [hasSelection, setHasSelection] = useState(false)
  const [lowRes, setLowRes] = useState(false)
  const [tee, setTee] = useState(null) // { id, name, price, available } from the server
  const [hint, setHint] = useState(null)
  const cart = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    fetch('/api/zuno/config').then((res) => res.json()).then((config) => setTee(config.customTee)).catch(() => {})
  }, [])

  useEffect(() => {
    const holder = holderRef.current
    const el = document.createElement('canvas')
    holder.appendChild(el)
    const canvas = new Canvas(el, {
      preserveObjectStacking: true,
      selection: false,
      backgroundColor: '#f5f5f5',
      allowTouchScrolling: true, // on phones, swiping the tee (not an image) still scrolls the page
    })
    let disposed = false

    const tee = new Path(TEE_PATH, { fill: COLORS[0].hex, stroke: '#d4d4d8', strokeWidth: 2, ...fixed })
    const collar = new Path('M190 60 Q250 110 310 60', {
      fill: '', stroke: 'rgba(0,0,0,0.15)', strokeWidth: 7, ...fixed,
    })
    const guide = new Rect({
      ...PRINT, fill: '', stroke: '#1d9bf0', strokeWidth: 1.5, strokeDashArray: [6, 6], ...fixed,
    })
    canvas.add(tee, collar, guide)

    const fit = () => {
      const width = Math.min(holder.clientWidth, 520)
      if (!width) return
      canvas.setDimensions({ width, height: (H * width) / W })
      canvas.setZoom(width / W)
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(holder)

    const addImage = async (url) => {
      const img = await FabricImage.fromURL(url)
      if (disposed) return
      if (Math.min(img.width, img.height) < MIN_PRINT_PX) setLowRes(true)
      const scale = Math.min(PRINT.width / img.width, PRINT.height / img.height) * 0.9
      img.set({
        scaleX: scale,
        scaleY: scale,
        originX: 'center',
        originY: 'center',
        left: PRINT.left + PRINT.width / 2,
        top: PRINT.top + PRINT.height / 2,
        clipPath: new Rect({ ...PRINT, absolutePositioned: true }),
        borderColor: '#1d9bf0',
        cornerColor: '#1d9bf0',
        cornerStyle: 'circle',
        cornerSize: 14,
        touchCornerSize: 30,
        transparentCorners: false,
      })
      canvas.add(img)
      canvas.setActiveObject(img)
      canvas.requestRenderAll()
    }

    const onSelect = () => setHasSelection(Boolean(canvas.getActiveObject()))
    canvas.on('selection:created', onSelect)
    canvas.on('selection:updated', onSelect)
    canvas.on('selection:cleared', onSelect)

    fabricRef.current = { canvas, tee, guide, addImage }
    ;(async () => {
      for (const image of images) await addImage(image.url)
    })()

    return () => {
      disposed = true
      observer.disconnect()
      fabricRef.current = null
      canvas.dispose().then(() => el.remove())
    }
    // The editor is created once; later uploads go through addImage
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const f = fabricRef.current
    if (!f) return
    f.tee.set('fill', color.hex)
    f.canvas.requestRenderAll()
  }, [color])

  // Delete / Backspace removes the selected image
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') removeSelected()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const withSelected = (fn) => {
    const f = fabricRef.current
    const obj = f?.canvas.getActiveObject()
    if (!obj) return
    fn(obj, f.canvas)
    f.canvas.requestRenderAll()
  }
  const removeSelected = () => withSelected((obj, canvas) => canvas.remove(obj))
  const centreSelected = () =>
    withSelected((obj) => {
      obj.set({ left: PRINT.left + PRINT.width / 2, top: PRINT.top + PRINT.height / 2 })
      obj.setCoords()
    })
  const bringForward = () => withSelected((obj, canvas) => canvas.bringObjectForward(obj))

  // What gets saved with the order: a picture of the finished tee, plus each artwork image on its own
  const exportDesign = () => {
    const f = fabricRef.current
    const placed = f?.canvas.getObjects('image') ?? []
    if (placed.length === 0) return null
    f.canvas.discardActiveObject()
    f.guide.visible = false
    const preview = f.canvas.toDataURL({ format: 'jpeg', quality: 0.85, multiplier: 1000 / f.canvas.getWidth() })
    f.guide.visible = true
    f.canvas.requestRenderAll()
    const artwork = placed.map((img) => {
      const el = img.getElement()
      const scale = Math.min(1, MAX_ARTWORK_PX / Math.max(el.naturalWidth, el.naturalHeight))
      const copy = document.createElement('canvas')
      copy.width = Math.round(el.naturalWidth * scale)
      copy.height = Math.round(el.naturalHeight * scale)
      copy.getContext('2d').drawImage(el, 0, 0, copy.width, copy.height)
      return copy.toDataURL('image/webp', 0.9)
    })
    return { preview, artwork }
  }

  const addToCart = () => {
    if (!size) return setHint('Please choose a size.')
    const design = exportDesign()
    if (!design) return setHint('Add at least one image to the tee first.')
    cart.add({
      productId: tee.id, name: tee.name, color: color.name, size, unitPrice: tee.price, image: design.preview, design,
    })
    navigate('/cart')
  }

  const addFiles = (e) => {
    for (const file of e.target.files) {
      if (file.type.startsWith('image/')) fabricRef.current?.addImage(URL.createObjectURL(file))
    }
    e.target.value = ''
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-2">
      <div>
        <div
          ref={holderRef}
          data-testid="tee-canvas"
          className="flex justify-center rounded-2xl bg-neutral-100 py-4"
        />
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <label className={`${toolClass} cursor-pointer`}>
            + Add image
            <input type="file" accept="image/*" multiple className="hidden" onChange={addFiles} />
          </label>
          <button onClick={centreSelected} disabled={!hasSelection} className={toolClass}>Centre</button>
          <button onClick={bringForward} disabled={!hasSelection} className={toolClass}>Bring forward</button>
          <button onClick={removeSelected} disabled={!hasSelection} className={toolClass}>Delete</button>
        </div>
        <p className="mt-3 text-center text-xs text-ink/50">
          Drag to move, pull the corners to resize, use the top handle to rotate. Only the part inside the
          dashed box is printed.
        </p>
      </div>

      <div className="md:py-6">
        <button onClick={onBack} className="text-sm font-medium text-ink/60 hover:text-brand">
          ← Back to upload
        </button>
        <h1 className="display mt-4 text-4xl">
          Design your <span className="text-brand">tee</span>
        </h1>

        {lowRes && (
          <p role="alert" className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
            One of your images is small (under {MIN_PRINT_PX}px), so it may print blurry. Use a larger file if
            you have one.
          </p>
        )}

        <div className="mt-8">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider">Tee colour · {color.name}</p>
          <div className="flex flex-wrap gap-3">
            {COLORS.map((c) => (
              <button
                key={c.name}
                onClick={() => setColor(c)}
                aria-label={c.name}
                aria-pressed={color.name === c.name}
                style={{ backgroundColor: c.hex }}
                className={`h-11 w-11 rounded-full border-2 transition ${
                  color.name === c.name ? 'border-brand ring-2 ring-brand/30' : 'border-neutral-300'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="mt-6">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider">Size</p>
          <div className="flex flex-wrap gap-2">
            {SIZES.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                aria-pressed={size === s}
                className={`h-11 w-14 rounded-lg border-2 text-sm font-semibold transition ${
                  size === s ? 'border-brand bg-brand text-white' : 'border-neutral-200 hover:border-brand'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {hint && <p role="alert" className="mt-6 text-sm text-red-500">{hint}</p>}
        <button
          onClick={addToCart}
          disabled={!tee?.available}
          className="mt-8 block w-full rounded-full bg-brand py-4 text-center text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark disabled:bg-neutral-300 disabled:shadow-none"
        >
          {tee && !tee.available ? 'Custom tees are paused' : `Add to cart${tee ? ` · ₹${tee.price}` : ''}`}
        </button>
      </div>
    </div>
  )
}
