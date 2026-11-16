import { useState } from 'react'
import { INSTAGRAM_URL } from '../config'
import { api } from '../api'

const PHONE_DISPLAY = '+91 755 004 5966'
const PHONE = '917550045966'
const WHATSAPP_URL = `https://wa.me/${PHONE}`

const CHANNELS = [
  {
    label: 'Call us',
    value: PHONE_DISPLAY,
    href: `tel:+${PHONE}`,
    icon: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />,
  },
  {
    label: 'WhatsApp',
    value: 'Chat with us',
    href: WHATSAPP_URL,
    external: true,
    icon: (
      <>
        <path d="M3 21l1.7-5A9 9 0 1 1 8 19.3L3 21z" />
        <path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 .8a4 4 0 0 1-1.8-1.8l.8-1-1-2L9 9.5z" />
      </>
    ),
  },
  {
    label: 'Instagram',
    value: '@zuno.clo',
    href: INSTAGRAM_URL,
    external: true,
    icon: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
      </>
    ),
  },
  {
    label: 'Location',
    value: 'Chennai, Tamil Nadu',
    href: 'https://www.google.com/maps/search/?api=1&query=Chennai',
    external: true,
    icon: (
      <>
        <path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z" />
        <circle cx="12" cy="9" r="2.5" />
      </>
    ),
  },
]

export default function Contact() {
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | sent
  const [error, setError] = useState('')

  // Saved to the backend; the team reads it in the admin under "Messages".
  const send = async (e) => {
    e.preventDefault()
    setStatus('sending')
    setError('')
    try {
      await api('/messages', { method: 'POST', body: { name, contact, message } })
      setStatus('sent')
      setName('')
      setContact('')
      setMessage('')
    } catch (err) {
      setError(err.message)
      setStatus('idle')
    }
  }

  return (
    <>
      {/* Sports-themed hero */}
      <section className="relative overflow-hidden bg-ink text-white">
        <img src="/images/lookbook/gym.webp" alt="" className="absolute inset-0 h-full w-full object-cover opacity-40 grayscale" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-brand/30" />
        {/* Claw slashes */}
        <svg viewBox="0 0 200 200" className="absolute -right-10 top-1/2 h-[140%] -translate-y-1/2 text-brand/30" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" aria-hidden="true">
          <path d="M60 190 150 10M95 190 185 10M25 190 115 10" />
        </svg>
        <div className="relative px-4 py-24 sm:px-10 sm:py-32">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand">Contact</p>
          <h1 className="display mt-3 text-5xl leading-[0.9] sm:text-7xl">
            No days off.<br />
            <span className="text-brand">Neither are we.</span>
          </h1>
          <p className="mt-6 max-w-md text-white/80">
            Questions about sizing, orders or custom tees? Call, text or DM — we'll get back to you fast.
          </p>
        </div>
      </section>

      {/* Contact channels */}
      <section className="px-4 py-16 sm:px-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CHANNELS.map((c) => (
            <a
              key={c.label}
              href={c.href}
              {...(c.external ? { target: '_blank', rel: 'noreferrer' } : {})}
              className="group flex items-center gap-4 border border-neutral-200 p-6 transition hover:border-brand hover:shadow-md"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand transition group-hover:bg-brand group-hover:text-white">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {c.icon}
                </svg>
              </span>
              <span>
                <span className="block text-xs font-bold uppercase tracking-wider text-ink/50">{c.label}</span>
                <span className="block font-semibold">{c.value}</span>
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* Feedback */}
      <section className="bg-neutral-50 px-4 py-16 sm:px-10">
        <div className="mx-auto max-w-2xl">
          <h2 className="display text-3xl">Send us <span className="text-brand">feedback</span></h2>
          <p className="mt-2 text-sm text-ink/60">Tell us what you love, what to fix, or what to drop next.</p>
          {status === 'sent' ? (
            <div className="mt-8 border-l-4 border-brand bg-white p-6">
              <p className="display text-xl">Message <span className="text-brand">received.</span></p>
              <p className="mt-1 text-sm text-ink/70">Thanks — we read every one. If you left a number or email, we'll get back to you.</p>
              <button onClick={() => setStatus('idle')} className="mt-4 text-sm font-semibold text-brand hover:underline">Send another</button>
            </div>
          ) : (
            <form onSubmit={send} className="mt-8 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={80}
                  placeholder="Your name (optional)"
                  className="w-full border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand"
                />
                <input
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  maxLength={120}
                  placeholder="Phone or email (optional)"
                  className="w-full border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand"
                />
              </div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                maxLength={2000}
                rows={6}
                placeholder="Your message…"
                className="w-full resize-y border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand"
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={!message.trim() || status === 'sending'}
                className="bg-brand px-8 py-3 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-brand-dark disabled:opacity-50"
              >
                {status === 'sending' ? 'Sending…' : 'Send message'}
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  )
}
