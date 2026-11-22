// Search with an image, the way Bagisto's shop does it: a small model running in the
// browser names what's in the photo, and that becomes an ordinary text search.
// TensorFlow is only downloaded the first time someone uses it.
import { api } from './api'

let modelPromise = null
const loadModel = () => {
  modelPromise ??= Promise.all([import('@tensorflow/tfjs'), import('@tensorflow-models/mobilenet')])
    .then(([, mobilenet]) => mobilenet.load({ version: 2, alpha: 1 }))
    .catch((err) => { modelPromise = null; throw err })
  return modelPromise
}

// MobileNet's labels (ImageNet) → words our product search understands
const GARMENTS = [
  [/jersey|t-shirt|tee shirt|sweatshirt|cardigan|pajama|military uniform|bulletproof vest/i, 'tee'],
]

// Colour names used in the catalog → a typical RGB for that colour
const SWATCHES = {
  black: [25, 25, 25], white: [240, 240, 240], cream: [236, 226, 200], brown: [110, 75, 50],
  green: [70, 130, 70], 'bottle green': [20, 70, 45], orange: [235, 120, 40], purple: [110, 60, 140],
  red: [190, 40, 40], blue: [40, 80, 170], navy: [25, 35, 70], grey: [130, 130, 130], gray: [130, 130, 130],
  yellow: [235, 205, 60], pink: [235, 150, 175], beige: [215, 195, 160],
}

const readImage = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => resolve({ img, url })
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('That file is not an image we can read.')) }
    img.src = url
  })

/** Most common colour in the middle of the photo, where the garment usually is. */
function dominantColour(img) {
  const size = 48
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  const sw = img.naturalWidth * 0.5, sh = img.naturalHeight * 0.5
  ctx.drawImage(img, img.naturalWidth * 0.25, img.naturalHeight * 0.25, sw, sh, 0, 0, size, size)
  const { data } = ctx.getImageData(0, 0, size, size)

  const buckets = new Map()
  for (let i = 0; i < data.length; i += 4) {
    const key = (data[i] >> 5) << 6 | (data[i + 1] >> 5) << 3 | data[i + 2] >> 5
    const b = buckets.get(key) ?? { n: 0, r: 0, g: 0, b: 0 }
    b.n++; b.r += data[i]; b.g += data[i + 1]; b.b += data[i + 2]
    buckets.set(key, b)
  }
  const top = [...buckets.values()].sort((a, b) => b.n - a.n)[0]
  return [top.r / top.n, top.g / top.n, top.b / top.n]
}

/** Closest catalog colour, or null if nothing is reasonably close. */
function nearestColour(rgb, catalogColours) {
  let best = null, bestDist = Infinity
  for (const name of catalogColours) {
    const swatch = SWATCHES[name.toLowerCase()]
    if (!swatch) continue
    // Weighted RGB distance: closer to how eyes judge colour than plain RGB
    const dr = rgb[0] - swatch[0], dg = rgb[1] - swatch[1], db = rgb[2] - swatch[2]
    const dist = Math.sqrt(2 * dr * dr + 4 * dg * dg + 3 * db * db)
    if (dist < bestDist) { bestDist = dist; best = name }
  }
  return bestDist < 260 ? best : null
}

/**
 * Looks at the photo and returns { q, color, labels, preview }.
 * q is a search word ('' if no garment was recognised), color a catalog colour or null.
 */
export async function analyseImage(file) {
  if (!file.type.startsWith('image/')) throw new Error('Please choose an image file.')
  if (file.size > 10 * 1024 * 1024) throw new Error('That image is over 10 MB. Try a smaller one.')

  const [{ img, url }, model, filters] = await Promise.all([
    readImage(file),
    loadModel(),
    api('/filters').catch(() => ({ colors: [] })),
  ])

  const predictions = await model.classify(img, 5)
  const labels = predictions.map((p) => p.className)
  const q = GARMENTS.find(([re]) => labels.some((l) => re.test(l)))?.[1] ?? ''
  const color = nearestColour(dominantColour(img), filters.colors ?? [])

  return { q, color, labels, preview: url }
}
