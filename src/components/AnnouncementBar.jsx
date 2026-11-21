import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

// The sentences are edited in the admin panel under "Live bar". `to` is an optional link.
const INTERVAL_MS = 4000

/** Thin bar above the navbar that cycles through short announcements. */
export default function AnnouncementBar() {
  const [messages, setMessages] = useState(null) // null while loading
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    api('/announcements').then((list) => setMessages(Array.isArray(list) ? list : [])).catch(() => setMessages([]))
  }, [])

  const count = messages?.length ?? 0

  useEffect(() => {
    if (paused || count < 2) return
    const id = setInterval(() => setI((n) => (n + 1) % count), INTERVAL_MS)
    return () => clearInterval(id)
  }, [paused, count])

  // Nothing to show (all hidden in the admin, or the backend is down): no bar
  if (messages && count === 0) return null

  const go = (step) => setI((n) => (n + step + count) % count)
  const msg = messages?.[i % Math.max(count, 1)]
  const content = !msg
    ? ' ' // keeps the bar's height while loading
    : msg.to?.startsWith('/')
      ? <Link to={msg.to} className="underline-offset-2 hover:underline">{msg.text}</Link>
      : msg.to
        ? <a href={msg.to} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">{msg.text}</a>
        : msg.text

  return (
    <div
      className="bg-ink text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="flex w-full items-center justify-between px-4 py-2 sm:px-6">
        <button type="button" onClick={() => go(-1)} aria-label="Previous announcement" className={`px-1 text-white/60 hover:text-white ${count < 2 ? 'invisible' : ''}`}>‹</button>
        <p key={i} aria-live="polite" className="animate-[fadeIn_0.4s_ease] text-center text-xs font-semibold uppercase tracking-wider">
          {content}
        </p>
        <button type="button" onClick={() => go(1)} aria-label="Next announcement" className={`px-1 text-white/60 hover:text-white ${count < 2 ? 'invisible' : ''}`}>›</button>
      </div>
      <style>{'@keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}'}</style>
    </div>
  )
}
