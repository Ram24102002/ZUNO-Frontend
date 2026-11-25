import { NavLink, useLocation } from 'react-router-dom'
import { useCart } from '../cart'
import { useWishlist } from '../wishlist'
import { HeartIcon } from './HeartButton'

const icon = 'h-6 w-6'
const svg = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }

const TABS = [
  { to: '/', label: 'Home', end: true, icon: <svg {...svg} className={icon}><path d="M3 11 12 4l9 7" /><path d="M5 10v10h14V10" /></svg> },
  {
    to: '/#shop',
    label: 'Shop',
    match: ['/shop-men', '/shop-women'],
    icon: <svg {...svg} className={icon}><path d="M8 4 4 7l2 4 2-1v10h8V10l2 1 2-4-4-3c0 1.7-1.8 3-4 3S8 5.7 8 4z" /></svg>,
  },
  { to: '/search', label: 'Search', icon: <svg {...svg} className={icon}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg> },
  { to: '/wishlist', label: 'Saved', badge: 'wishlist', icon: <HeartIcon className={icon} /> },
  { to: '/cart', label: 'Bag', badge: 'cart', icon: <svg {...svg} className={icon}><path d="M6 8h12l1 12H5L6 8z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg> },
]

// Pages with their own bar pinned to the bottom of the screen
const HIDDEN_ON = ['/product/']

/** Phones: thumb-reach navigation pinned to the bottom of the screen. */
export default function TabBar() {
  const { pathname } = useLocation()
  const { count } = useCart()
  const { count: wishlistCount } = useWishlist()
  if (HIDDEN_ON.some((p) => pathname.startsWith(p))) return null

  const badges = { cart: count, wishlist: wishlistCount }

  return (
    <>
      {/* Room at the end of the page so the bar never hides the footer */}
      <div className="h-16 md:hidden" aria-hidden="true" />
      <nav
        aria-label="Quick links"
        className="fixed inset-x-0 bottom-0 z-10 border-t border-neutral-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        <ul className="grid grid-cols-5">
          {TABS.map((t) => {
            const n = t.badge ? badges[t.badge] : 0
            return (
              <li key={t.to}>
                <NavLink
                  to={t.to}
                  end={t.end}
                  className={({ isActive }) => {
                    const active = t.match ? t.match.includes(pathname) : isActive && !(t.to === '/#shop')
                    return `flex flex-col items-center gap-0.5 py-2 text-[10px] font-semibold uppercase tracking-wider transition active:scale-90 ${
                      active ? 'text-brand' : 'text-ink/60'
                    }`
                  }}
                >
                  <span className="relative">
                    {t.icon}
                    {n > 0 && (
                      <span key={n} className="pop absolute -top-1.5 -right-2 rounded-full bg-brand px-1.5 text-[10px] leading-4 text-white">{n}</span>
                    )}
                  </span>
                  {t.label}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>
    </>
  )
}
