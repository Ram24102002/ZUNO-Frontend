import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { analyseImage } from '../imageSearch'

const CameraIcon = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
    <circle cx="12" cy="13" r="3.5" />
  </svg>
)

/** Camera button for a search box: pick a photo, we find similar products. */
export default function ImageSearchButton({ className = 'relative', tabIndex }) {
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  // Hide an error after a few seconds
  useEffect(() => {
    if (!error) return
    const t = setTimeout(() => setError(null), 5000)
    return () => clearTimeout(t)
  }, [error])

  const onFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // let the same photo be picked again
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      const result = await analyseImage(file)
      const params = new URLSearchParams()
      if (result.q) params.set('q', result.q)
      if (result.color) params.set('color', result.color)
      navigate(`/search${params.size ? `?${params}` : ''}`, { state: { imageSearch: result } })
    } catch (err) {
      setError(err?.message?.includes('fetch') ? 'Could not load image search. Check your connection.' : err?.message || 'Image search failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <span className={className}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        tabIndex={tabIndex}
        className="flex items-center text-ink/50 transition hover:text-brand disabled:cursor-wait"
        aria-label="Search with an image"
        title="Search with an image"
      >
        {busy
          ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand border-t-transparent" />
          : <CameraIcon />}
      </button>
      <input ref={inputRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
      <span role="status" className="sr-only">{busy ? 'Looking at your photo…' : ''}</span>
      {error && (
        // Beside the button, not below it: the navbar search bar clips anything below
        <span role="alert" className="absolute top-1/2 right-full z-10 mr-3 w-max max-w-60 -translate-y-1/2 rounded-lg bg-ink px-3 py-1.5 text-xs text-white shadow-lg">
          {error}
        </span>
      )}
    </span>
  )
}
