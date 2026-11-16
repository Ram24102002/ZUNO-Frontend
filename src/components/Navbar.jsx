import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import Logo from './Logo'
import AnnouncementBar from './AnnouncementBar'
import { useCart } from '../cart'
import { useAccount } from '../account'
import { useWishlist } from '../wishlist'
import { HeartIcon } from './HeartButton'

// Left-side links. Men/Women filter the shop by category slug.
const LINKS = [
  { to: '/shop-men', label: 'Men' },
  { to: '/shop-women', label: 'Women' },
  { to: '/design', label: 'Create' },
  { to: '/about', label: 'About' },
]

const textClass = (active) =>
  `text-sm font-semibold uppercase tracking-wider transition ${
    active ? 'text-brand' : 'text-ink/70 hover:text-brand'
  }`

const iconClass = ({ isActive }) => `transition ${isActive ? 'text-brand' : 'text-ink/70 hover:text-brand'}`

/** True when the current URL matches a link, including its ?query part. */
function useIsActive() {
  const { pathname, search } = useLocation()
  return (to) => {
    const [path, query = ''] = to.split('?')
    if (path !== pathname) return false
    if (!query) return path !== '/' || !search
    const want = new URLSearchParams(query)
    const have = new URLSearchParams(search)
    return [...want].every(([k, v]) => have.get(k) === v)
  }
}

export default function Navbar() {
  const { count } = useCart()
  const { customer } = useAccount()
  const { count: wishlistCount } = useWishlist()
  const isActive = useIsActive()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  // Close the mobile menu after navigating
  useEffect(() => setOpen(false), [location.pathname, location.search])

  return (
    <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/90 backdrop-blur">
      <AnnouncementBar />
      <nav className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-3 sm:px-6">
        {/* Left: links (desktop) / menu button (mobile) */}
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="text-ink/70 hover:text-brand md:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
          <div className="hidden items-center gap-6 md:flex">
            {LINKS.map((l) => (
              <Link key={l.to} to={l.to} className={textClass(isActive(l.to))}>{l.label}</Link>
            ))}
          </div>
        </div>

        {/* Center: logo */}
        <Link to="/" aria-label="ZUNO home" className="justify-self-center"><Logo /></Link>

        {/* Right: account + contact + wishlist + cart */}
        <div className="flex items-center justify-end gap-4 sm:gap-6">
          <NavLink to="/account" className={iconClass} aria-label={customer ? `Your account, ${customer.firstName}` : 'Log in'}>
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          </NavLink>
          <NavLink to="/contact" className={iconClass} aria-label="Contact us">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
            </svg>
          </NavLink>
          <NavLink to="/wishlist" className={iconClass} aria-label={`Wishlist, ${wishlistCount} items`}>
            <span className="relative block">
              <HeartIcon className="h-6 w-6" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-2 rounded-full bg-brand px-1.5 text-[10px] leading-4 text-white">{wishlistCount}</span>
              )}
            </span>
          </NavLink>
          <NavLink to="/cart" className={iconClass} aria-label={`Cart, ${count} items`}>
            <span className="relative block">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 8h12l1 12H5L6 8z" />
                <path d="M9 8V6a3 3 0 0 1 6 0v2" />
              </svg>
              {count > 0 && (
                <span className="absolute -top-1.5 -right-2 rounded-full bg-brand px-1.5 text-[10px] leading-4 text-white">{count}</span>
              )}
            </span>
          </NavLink>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-neutral-200 bg-white md:hidden">
          <div className="flex w-full flex-col px-4 sm:px-6 py-2">
            {LINKS.map((l) => (
              <Link key={l.to} to={l.to} className={`py-3 ${textClass(isActive(l.to))}`}>{l.label}</Link>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
