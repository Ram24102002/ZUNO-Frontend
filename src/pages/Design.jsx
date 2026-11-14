import { useState } from 'react'
import TeeEditor from '../components/TeeEditor'

const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp']
const MAX_MB = 10

export default function Design() {
  const [step, setStep] = useState('upload') // 'upload' -> 'edit'
  const [images, setImages] = useState([]) // { id, name, url }
  const [error, setError] = useState(null)
  const [dragging, setDragging] = useState(false)

  const addFiles = (fileList) => {
    const added = []
    let problem = null
    for (const file of fileList) {
      if (!ACCEPTED.includes(file.type)) problem = `${file.name} is not a PNG, JPG or WebP image.`
      else if (file.size > MAX_MB * 1024 * 1024) problem = `${file.name} is larger than ${MAX_MB} MB.`
      else added.push({ id: crypto.randomUUID(), name: file.name, url: URL.createObjectURL(file) })
    }
    setError(problem)
    setImages((current) => [...current, ...added])
  }

  const removeImage = (image) => {
    URL.revokeObjectURL(image.url)
    setImages((current) => current.filter((i) => i.id !== image.id))
  }

  if (step === 'edit') return <TeeEditor images={images} onBack={() => setStep('upload')} />

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="display text-4xl">
        Design your own <span className="text-brand">tee</span>
      </h1>
      <p className="mt-3 text-ink/70">
        Upload your artwork, then place it on the T-shirt on the next screen.
      </p>

      <label
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }}
        className={`mt-8 flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed px-6 py-14 text-center transition ${
          dragging ? 'border-brand bg-brand-light' : 'border-neutral-300 hover:border-brand'
        }`}
      >
        <span className="text-lg font-semibold">Drop your images here or tap to choose</span>
        <span className="mt-2 text-sm text-ink/60">PNG, JPG or WebP, up to {MAX_MB} MB each</span>
        <input
          type="file"
          accept={ACCEPTED.join(',')}
          multiple
          className="hidden"
          onChange={(e) => { addFiles(e.target.files); e.target.value = '' }}
        />
      </label>

      {error && <p role="alert" className="mt-3 text-sm text-red-500">{error}</p>}

      {images.length > 0 && (
        <ul className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((image) => (
            <li key={image.id} className="relative overflow-hidden rounded-lg border border-neutral-200">
              <img src={image.url} alt={image.name} className="aspect-square w-full object-contain" />
              <button
                onClick={() => removeImage(image)}
                aria-label={`Remove ${image.name}`}
                className="absolute top-1 right-1 h-7 w-7 rounded-full bg-white/90 text-sm font-bold shadow hover:text-red-500"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={() => setStep('edit')}
        disabled={images.length === 0}
        className="mt-8 w-full rounded-full bg-brand py-4 text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark disabled:bg-neutral-300 disabled:shadow-none"
      >
        Next: place it on the tee
      </button>
    </div>
  )
}
