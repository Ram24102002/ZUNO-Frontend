import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { Stars } from './Stars'

// Avatar gradients, picked from the reviewer's name so each person keeps their colour
const GRADIENTS = [
  'from-sky-400 to-blue-600',
  'from-fuchsia-400 to-purple-600',
  'from-amber-300 to-orange-500',
  'from-emerald-300 to-teal-600',
  'from-rose-400 to-red-500',
  'from-indigo-400 to-cyan-400',
]

const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)

const initials = (name) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('') || '?'

/** Initials in a gradient circle with a spinning ring and a gentle bob. */
function Avatar({ name, delay }) {
  const g = GRADIENTS[hash(name) % GRADIENTS.length]
  return (
    <span className="relative inline-flex h-12 w-12 shrink-0 animate-[bob_3s_ease-in-out_infinite]" style={{ animationDelay: `${delay}s` }}>
      <span className={`absolute -inset-0.5 animate-[spin_6s_linear_infinite] rounded-full bg-gradient-to-tr ${g} opacity-70 blur-[1px] motion-reduce:animate-none`} />
      <span className={`relative flex h-full w-full items-center justify-center rounded-full border-2 border-white bg-gradient-to-br ${g} text-sm font-bold text-white`}>
        {initials(name)}
      </span>
    </span>
  )
}

function Card({ r, i }) {
  return (
    <figure className="flex w-72 shrink-0 flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:w-80">
      <div className="flex items-center gap-3">
        <Avatar name={r.name} delay={(i % 5) * 0.4} />
        <figcaption className="min-w-0">
          <p className="truncate font-semibold text-ink">{r.name}</p>
          <p className="text-xs text-ink/50">{r.verified ? '✓ Verified buyer' : 'Customer'}</p>
        </figcaption>
      </div>
      <Stars value={r.rating} />
      <blockquote className="text-sm leading-relaxed text-ink/80">
        <p className="font-semibold text-ink">{r.title}</p>
        <p className="mt-1 line-clamp-4">{r.comment}</p>
      </blockquote>
      <Link to={`/product/${r.product.slug}`} className="mt-auto text-xs font-semibold uppercase tracking-wider text-brand hover:underline">
        {r.product.name} →
      </Link>
    </figure>
  )
}

/** Home-page strip of real, approved 4–5 star reviews. Hidden until there are some. */
export default function Testimonials() {
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    api('/testimonials').then((list) => setReviews(Array.isArray(list) ? list : [])).catch(() => {})
  }, [])

  if (reviews.length === 0) return null

  // Few reviews: a centred row. Enough to fill the screen: an endless, pausable marquee.
  const marquee = reviews.length >= 4
  const items = marquee ? [...reviews, ...reviews] : reviews

  return (
    <section className="overflow-hidden bg-neutral-50 py-20">
      <div className="mx-auto max-w-2xl px-4 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-ink/60">Real people, real reps</p>
        <h2 className="display mt-3 text-3xl sm:text-4xl">What the <span className="text-brand">crew</span> says</h2>
      </div>

      <div className={`mt-10 ${marquee ? '[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]' : ''}`}>
        <div
          className={
            marquee
              ? 'flex w-max animate-[marquee_45s_linear_infinite] gap-5 px-4 py-2 hover:[animation-play-state:paused] motion-reduce:animate-none'
              : 'flex flex-wrap justify-center gap-5 px-4 py-2'
          }
        >
          {items.map((r, i) => (
            <div key={`${r.id}-${i}`} aria-hidden={i >= reviews.length || undefined}>
              <Card r={r} i={i} />
            </div>
          ))}
        </div>
      </div>

      <style>{'@keyframes marquee{to{transform:translateX(-50%)}}@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}'}</style>
    </section>
  )
}
