import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useCart } from '../cart'

/** Slides up after something goes in the cart: photo, choice and a shortcut to checkout. Hides itself after 5 s. */
export default function AddedSheet() {
  const { lastAdded, dismissAdded, count } = useCart()
  const { pathname } = useLocation()

  useEffect(() => {
    if (!lastAdded) return
    const timer = setTimeout(dismissAdded, 5000)
    return () => clearTimeout(timer)
  }, [lastAdded, dismissAdded])

  // Leaving the page closes it
  useEffect(() => dismissAdded(), [pathname, dismissAdded])

  if (!lastAdded) return null
  const detail = [lastAdded.color, lastAdded.size && `Size ${lastAdded.size}`].filter(Boolean).join(' · ')

  return (
    <div
      key={lastAdded.at}
      role="status"
      className="sheet-up fixed inset-x-0 bottom-0 z-30 rounded-t-3xl bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(0,0,0,0.12)] md:inset-x-auto md:right-6 md:bottom-6 md:w-96 md:rounded-3xl"
    >
      <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-neutral-200 md:hidden" aria-hidden="true" />
      <div className="flex items-center gap-3">
        {lastAdded.image ? (
          <img src={lastAdded.image} alt="" className="h-16 w-14 shrink-0 rounded-lg bg-neutral-100 object-cover" />
        ) : (
          <div className="h-16 w-14 shrink-0 rounded-lg bg-brand-light" />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">✓ Added to bag</p>
          <p className="truncate font-semibold">{lastAdded.name}</p>
          {detail && <p className="truncate text-sm text-ink/60">{detail}</p>}
        </div>
        <button type="button" onClick={dismissAdded} aria-label="Close" className="self-start p-1 text-ink/50 hover:text-ink">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={dismissAdded}
          className="rounded-full border-2 border-neutral-200 py-3 text-sm font-semibold uppercase tracking-wider transition active:scale-95"
        >
          Keep shopping
        </button>
        <Link
          to="/cart"
          className="rounded-full bg-brand py-3 text-center text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-brand/30 transition active:scale-95"
        >
          Checkout · {count}
        </Link>
      </div>
    </div>
  )
}
