import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

// Edit these to change what the bar says. `to` is optional.
const MESSAGES = [
  { text: 'Free shipping on orders over ₹999' },
  { text: 'Design your own tee — try the studio', to: '/design' },
  { text: 'New drops every week' },
]

const INTERVAL_MS = 4000

/** Thin bar above the navbar that cycles through short announcements. */
export default function AnnouncementBar() {
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused || MESSAGES.length < 2) return
    const id = setInterval(() => setI((n) => (n + 1) % MESSAGES.length), INTERVAL_MS)
    return () => clearInterval(id)
  }, [paused])

  const go = (step) => setI((n) => (n + step + MESSAGES.length) % MESSAGES.length)
  const msg = MESSAGES[i]
  const content = msg.to
    ? <Link to={msg.to} className="underline-offset-2 hover:underline">{msg.text}</Link>
    : msg.text

  return (
    <div
      className="bg-ink text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="flex w-full items-center justify-between px-4 py-2 sm:px-6">
        <button type="button" onClick={() => go(-1)} aria-label="Previous announcement" className="px-1 text-white/60 hover:text-white">‹</button>
        <p key={i} aria-live="polite" className="animate-[fadeIn_0.4s_ease] text-center text-xs font-semibold uppercase tracking-wider">
          {content}
        </p>
        <button type="button" onClick={() => go(1)} aria-label="Next announcement" className="px-1 text-white/60 hover:text-white">›</button>
      </div>
      <style>{'@keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}'}</style>
    </div>
  )
}
