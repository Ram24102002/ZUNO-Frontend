const STAR = 'M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z'

/** Read-only star rating, e.g. 4.5 of 5. */
export function Stars({ value, className = 'h-4 w-4' }) {
  return (
    <span className="inline-flex" role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const fill = Math.max(0, Math.min(1, value - n + 1)) * 100
        return (
          <svg key={n} viewBox="0 0 24 24" className={className} aria-hidden="true">
            <defs>
              <linearGradient id={`star-${n}-${fill}`}>
                <stop offset={`${fill}%`} stopColor="#f59e0b" />
                <stop offset={`${fill}%`} stopColor="#e5e5e5" />
              </linearGradient>
            </defs>
            <path d={STAR} fill={`url(#star-${n}-${fill})`} />
          </svg>
        )
      })}
    </span>
  )
}

/** Clickable 1-5 star picker for writing a review. */
export function StarInput({ value, onChange }) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Your rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          onClick={() => onChange(n)}
          className="rounded p-0.5 transition hover:scale-110"
        >
          <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden="true">
            <path d={STAR} fill={n <= value ? '#f59e0b' : '#e5e5e5'} />
          </svg>
        </button>
      ))}
    </div>
  )
}
