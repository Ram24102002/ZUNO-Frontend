import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
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

const SearchIcon = ({ className = 'h-6 w-6' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
)

const iconClass =({ isActive }) => `transition ${isActive ? 'text-brand' : 'text-ink/70 hover:text-brand'}`

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
  const [searchOpen, setSearchOpen] = useState(false)
  const [term, setTerm] = useState('')
  const searchRef = useRef(null)
  const navigate = useNavigate()

  // Close the mobile menu and search bar after navigating
  useEffect(() => { setOpen(false); setSearchOpen(false) }, [location.pathname, location.search])

  // Open search: prefill with the current query and put the cursor in it
  useEffect(() => {
    if (!searchOpen) return
    setTerm(location.pathname === '/search' ? new URLSearchParams(location.search).get('q') ?? '' : '')
    searchRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && setSearchOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [searchOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  const submitSearch = (e) => {
    e.preventDefault()
    const q = term.trim()
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/search')
    setSearchOpen(false)
  }

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

        {/* Right: search + account + wishlist + cart */}
        <div className="flex items-center justify-end gap-4 sm:gap-6">
          <button
            type="button"
            onClick={() => setSearchOpen((o) => !o)}
            className={`transition ${searchOpen || location.pathname === '/search' ? 'text-brand' : 'text-ink/70 hover:text-brand'}`}
            aria-label={searchOpen ? 'Close search' : 'Search products'}
            aria-expanded={searchOpen}
          >
            <SearchIcon />
          </button>
          <NavLink to="/account" className={iconClass} aria-label={customer ? `Your account, ${customer.firstName}` : 'Log in'}>
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
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

      {/* Search bar: slides open under the nav */}
      <div className={`grid transition-all duration-300 ${searchOpen ? 'grid-rows-[1fr] border-t border-neutral-200' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <form onSubmit={submitSearch} role="search" className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 sm:px-6">
            <label className="relative flex-1">
              <span className="sr-only">Search products</span>
              <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-ink/40"><SearchIcon className="h-5 w-5" /></span>
              <input
                ref={searchRef}
                type="search"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                tabIndex={searchOpen ? 0 : -1}
                placeholder="Search tees, hoodies, colours…"
                className="w-full rounded-full border-2 border-neutral-200 py-2.5 pr-4 pl-11 outline-none focus:border-brand"
              />
            </label>
            <button type="submit" tabIndex={searchOpen ? 0 : -1} className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90">
              Search
            </button>
            <button type="button" onClick={() => setSearchOpen(false)} tabIndex={searchOpen ? 0 : -1} className="text-sm font-semibold text-ink/60 hover:text-brand">
              Cancel
            </button>
          </form>
        </div>
      </div>

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
