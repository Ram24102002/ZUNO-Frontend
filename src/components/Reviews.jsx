import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, formatDate } from '../api'
import { useAccount } from '../account'
import { Stars, StarInput } from './Stars'

const inputClass = 'mt-1 w-full rounded-lg border-2 border-neutral-200 px-4 py-2.5 outline-none focus:border-brand'

function ReviewForm({ slug, onDone }) {
  const { customer } = useAccount()
  const [guestReviews, setGuestReviews] = useState(false)
  const [form, setForm] = useState({ rating: 0, title: '', comment: '', name: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const field = (name) => ({ value: form[name], onChange: (e) => setForm((f) => ({ ...f, [name]: e.target.value })) })

  // Whether reviews without an account are allowed is a setting in the Bagisto admin
  useEffect(() => {
    api('/config').then((c) => setGuestReviews(c.guestReviews)).catch(() => {})
  }, [])

  if (!customer && !guestReviews) {
    return (
      <p className="rounded-2xl bg-neutral-50 p-5 text-sm text-ink/70">
        <Link to="/account" state={{ from: `/product/${slug}` }} className="font-semibold text-brand">Log in</Link> to write a review.
      </p>
    )
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!form.rating) return setError('Choose a star rating.')
    setBusy(true)
    setError(null)
    try {
      const { message } = await api(`/products/${slug}/reviews`, { method: 'POST', body: form })
      onDone(message)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl bg-neutral-50 p-5">
      <StarInput value={form.rating} onChange={(rating) => setForm((f) => ({ ...f, rating }))} />
      {!customer && (
        <label className="block text-sm font-semibold">
          Your name
          <input {...field('name')} required maxLength={80} className={inputClass} />
        </label>
      )}
      <label className="block text-sm font-semibold">
        Headline
        <input {...field('title')} required maxLength={120} placeholder="Fits perfectly" className={inputClass} />
      </label>
      <label className="block text-sm font-semibold">
        Review
        <textarea {...field('comment')} required rows={4} maxLength={2000} className={inputClass} />
      </label>
      {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
      <button disabled={busy} className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-brand-dark disabled:bg-neutral-300">
        {busy ? 'Sending…' : 'Post review'}
      </button>
    </form>
  )
}

/** Ratings summary, approved reviews and the "write a review" form for one product. */
export default function Reviews({ slug }) {
  const [data, setData] = useState(null)
  const [page, setPage] = useState(1)
  const [writing, setWriting] = useState(false)
  const [thanks, setThanks] = useState(null)

  useEffect(() => {
    api(`/products/${slug}/reviews?page=${page}`)
      .then((next) => setData((prev) => (page > 1 && prev ? { ...next, reviews: [...prev.reviews, ...next.reviews] } : next)))
      .catch(() => {})
  }, [slug, page])

  if (!data) return null
  const { rating, breakdown, reviews } = data

  return (
    <section id="reviews" className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-16">
      <div className="grid gap-10 border-t border-neutral-200 pt-12 md:grid-cols-[18rem_1fr]">
        <div>
          <h2 className="display text-3xl">Reviews</h2>
          {rating.count > 0 ? (
            <>
              <p className="mt-4 flex items-center gap-3">
                <span className="text-4xl font-bold">{rating.average}</span>
                <span>
                  <Stars value={rating.average} className="h-5 w-5" />
                  <span className="block text-sm text-ink/60">{rating.count} review{rating.count === 1 ? '' : 's'}</span>
                </span>
              </p>
              <ul className="mt-4 space-y-1">
                {[5, 4, 3, 2, 1].map((stars) => (
                  <li key={stars} className="flex items-center gap-2 text-sm">
                    <span className="w-3">{stars}</span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-200">
                      <span className="block h-full bg-amber-400" style={{ width: `${(breakdown[stars] / rating.count) * 100}%` }} />
                    </span>
                    <span className="w-6 text-right text-ink/60">{breakdown[stars]}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="mt-4 text-ink/60">No reviews yet. Be the first.</p>
          )}
          {!writing && !thanks && (
            <button onClick={() => setWriting(true)} className="mt-6 rounded-full border-2 border-ink px-6 py-2.5 text-sm font-semibold uppercase tracking-wider transition hover:border-brand hover:text-brand">
              Write a review
            </button>
          )}
        </div>

        <div className="space-y-6">
          {thanks && <p role="status" className="rounded-2xl bg-brand-light p-5 text-sm">{thanks}</p>}
          {writing && !thanks && (
            <ReviewForm slug={slug} onDone={(message) => { setThanks(message); setWriting(false) }} />
          )}
          {reviews.map((r) => (
            <article key={r.id} className="border-b border-neutral-200 pb-6">
              <div className="flex items-center gap-3">
                <Stars value={r.rating} />
                <h3 className="font-semibold">{r.title}</h3>
              </div>
              <p className="mt-2 whitespace-pre-line text-ink/80">{r.comment}</p>
              <p className="mt-2 text-xs text-ink/50">
                {r.name} · {formatDate(r.date)}
                {r.verified && <span className="ml-2 font-semibold text-brand">✓ Verified buyer</span>}
              </p>
            </article>
          ))}
          {data.page < data.lastPage && (
            <button onClick={() => setPage((p) => p + 1)} className="font-semibold text-brand">Show more reviews</button>
          )}
        </div>
      </div>
    </section>
  )
}
