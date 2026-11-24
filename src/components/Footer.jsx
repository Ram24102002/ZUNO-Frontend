import { Link } from 'react-router-dom'
import { INSTAGRAM_URL, YOUTUBE_URL } from '../config'

const LINK_GROUPS = [
  {
    title: 'Shop',
    links: [
      { label: 'All', to: '/' },
      { label: 'Women', to: '/shop-women' },
      { label: 'Men', to: '/shop-men' },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'Track Order', to: '/orders' },
      { label: 'Contact', to: '/contact' },
    ],
  },
  {
    title: 'ZUNO',
    links: [
      { label: 'About', to: '/about' },
      { label: 'Create Your Own', to: '/design' },
    ],
  },
  {
    title: 'Social',
    links: [
      { label: 'Instagram', href: INSTAGRAM_URL, Icon: InstagramIcon },
      { label: 'YouTube', href: YOUTUBE_URL, Icon: YouTubeIcon },
    ],
  },
]

const PAYMENT_METHODS = ['UPI', 'Visa', 'Mastercard', 'RuPay', 'Net Banking', 'Wallets']

const MARQUEE =['Wear the Mindset', 'Design Your Own Tee', 'Fresh Drops', 'Built Different', '@zuno.clo']

function MarqueeRow() {
  return (
    <div className="flex shrink-0 items-center gap-8 pr-8" aria-hidden="true">
      {MARQUEE.map((t) => (
        <span key={t} className="flex items-center gap-8 whitespace-nowrap">
          {t}
          <span className="text-brand">✦</span>
        </span>
      ))}
    </div>
  )
}

export default function Footer() {
  return (
    <footer className="bg-ink text-white">
      {/* Marquee band */}
      <div className="group overflow-hidden border-y border-white/10 bg-brand py-3 text-sm font-black uppercase italic tracking-wider text-white">
        <div className="flex w-max animate-[footer-marquee_30s_linear_infinite] group-hover:[animation-play-state:paused] motion-reduce:animate-none [&_.text-brand]:text-white/60">
          <MarqueeRow /><MarqueeRow />
        </div>
      </div>

      <div className="px-4 pt-14 pb-8 sm:px-10">
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-6xl font-black uppercase italic leading-none tracking-tighter sm:text-8xl">
              ZUNO<span className="text-brand">.</span>
            </p>
            <p className="mt-3 text-sm text-white/50">Wear the Mindset.</p>
          </div>

          <nav className="grid grid-cols-2 gap-x-12 gap-y-8 sm:grid-cols-4" aria-label="Footer">
            {LINK_GROUPS.map((g) => (
              <div key={g.title}>
                <p className="mb-4 text-xs font-black uppercase italic tracking-widest text-brand">{g.title}</p>
                <ul className="space-y-2.5">
                  {g.links.map((l) => {
                    const cls = 'group/link inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-white/70 transition hover:text-white'
                    const arrow = <span className="-translate-x-1 text-brand opacity-0 transition group-hover/link:translate-x-0 group-hover/link:opacity-100">→</span>
                    return (
                      <li key={l.label}>
                        {l.href ? (
                          <a href={l.href} target="_blank" rel="noreferrer" className={cls}>
                            {l.Icon && <l.Icon className="h-4 w-4 shrink-0 transition group-hover/link:text-brand" />}
                            {l.label}
                            {arrow}
                          </a>
                        ) : (
                          <Link to={l.to} className={cls}>
                            {l.label}
                            {arrow}
                          </Link>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-12 flex flex-col-reverse gap-4 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} ZUNO. All rights reserved. · Secure payments via Razorpay</p>
          <ul className="flex flex-wrap gap-2" aria-label="Accepted payment methods">
            {PAYMENT_METHODS.map((m) => (
              <li
                key={m}
                className="rounded border border-white/15 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white/70"
              >
                {m}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <style>{'@keyframes footer-marquee{to{transform:translateX(-50%)}}'}</style>
    </footer>
  )
}

function InstagramIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  )
}

function YouTubeIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="4" />
      <path d="M10 9.5v5l4.5-2.5z" fill="currentColor" />
    </svg>
  )
}
