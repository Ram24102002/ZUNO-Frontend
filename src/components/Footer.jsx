import { Link } from 'react-router-dom'
import { INSTAGRAM_URL } from '../config'
import Logo from './Logo'

// Link columns. `href` = external, `to` = page in the shop.
const COLUMNS = [
  {
    title: 'Help',
    links: [
      { label: 'Contact Us', to: '/contact' },
      { label: 'Track Your Order', to: '/orders' },
      { label: 'Your Cart', to: '/cart' },
    ],
  },
  {
    title: 'My Account',
    links: [
      { label: 'Login', to: '/account' },
      { label: 'Orders', to: '/orders' },
      { label: 'Wishlist', to: '/wishlist' },
    ],
  },
  {
    title: 'Pages',
    links: [
      { label: 'Shop All', to: '/' },
      { label: 'Women', to: '/shop-women' },
      { label: 'Men', to: '/shop-men' },
      { label: 'Create Your Own', to: '/design' },
      { label: 'About Us', to: '/about' },
      { label: 'Contact', to: '/contact' },
    ],
  },
]

const PAYMENTS = ['UPI', 'Cards', 'Net Banking', 'Razorpay', 'COD']

const linkClass = 'text-sm text-ink/60 transition hover:text-brand'

function FooterLink({ label, to, href }) {
  return href
    ? <a href={href} target="_blank" rel="noreferrer" className={linkClass}>{label}</a>
    : <Link to={to} className={linkClass}>{label}</Link>
}

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-50">
      <div className="grid gap-10 px-4 py-12 sm:px-10 md:grid-cols-[1fr_1fr_1fr_1.5fr]">
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="text-sm font-bold">{col.title}</p>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => <li key={l.label}><FooterLink {...l} /></li>)}
            </ul>
          </div>
        ))}

        <div>
          <p className="text-sm font-bold">More About ZUNO</p>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <Link to="/about" className="group bg-white transition hover:shadow-md">
              <div className="flex h-20 items-center justify-center"><Logo /></div>
              <p className="bg-neutral-100 p-3 text-xs font-semibold">Our Story</p>
            </Link>
            <Link to="/design" className="group bg-white transition hover:shadow-md">
              <div className="flex h-20 items-center justify-center text-ink/80">
                <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                </svg>
              </div>
              <p className="bg-neutral-100 p-3 text-xs font-semibold">Design Your Tee</p>
            </Link>
            <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="group bg-white transition hover:shadow-md">
              <div className="flex h-20 items-center justify-center text-ink/80">
                <InstagramIcon className="h-7 w-7" />
              </div>
              <p className="bg-neutral-100 p-3 text-xs font-semibold">@zuno.clo</p>
            </a>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 px-4 pb-8 sm:flex-row sm:items-center sm:justify-between sm:px-10">
        <div className="flex flex-wrap gap-2">
          {PAYMENTS.map((p) => (
            <span key={p} className="rounded border border-neutral-300 bg-white px-2 py-1 text-[11px] font-bold text-ink/70">{p}</span>
          ))}
        </div>
        <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" aria-label="ZUNO on Instagram" className="text-ink/80 transition hover:text-brand">
          <InstagramIcon className="h-6 w-6" />
        </a>
      </div>

      <div className="flex flex-col gap-2 border-t border-neutral-200 px-4 py-5 text-xs text-ink/60 sm:flex-row sm:items-center sm:justify-between sm:px-10">
        <p>© {new Date().getFullYear()} ZUNO | All Rights Reserved. | Wear the Mindset.</p>
        <Link to="/about" className="underline underline-offset-2 hover:text-brand">Website</Link>
      </div>
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
