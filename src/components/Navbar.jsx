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

// Mobile drawer content per tab: swipeable image cards + a link list.
const MENU = {
  men: {
    label: 'Men',
    cards: [
      { label: 'Shop Men', img: '/images/lookbook/street.webp', to: '/shop-men' },
      { label: 'Design Your Own', img: '/images/products/flame-tee-1.webp', to: '/design' },
      { label: 'Gym Fits', img: '/images/lookbook/gym.webp', to: '/shop-men' },
    ],
    links: [
      { label: "Shop All Men's", to: '/shop-men' },
      { label: 'Oversized Tees', to: '/search?q=tee' },
      { label: 'Polos', to: '/search?q=polo' },
    ],
  },
  women: {
    label: 'Women',
    cards: [
      { label: 'Shop Women', img: '/images/lookbook/gym.webp', to: '/shop-women' },
      { label: 'Design Your Own', img: '/images/products/flame-tee-1.webp', to: '/design' },
      { label: 'Street Fits', img: '/images/lookbook/city.webp', to: '/shop-women' },
    ],
    links: [
      { label: "Shop All Women's", to: '/shop-women' },
      { label: 'Oversized Tees', to: '/search?q=tee' },
      { label: 'Polos', to: '/search?q=polo' },
    ],
  },
}

// Small links at the bottom of the mobile drawer
const SECONDARY = [
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
  { to: '/orders', label: 'Track Order' },
  { to: '/account', label: 'My Account' },
]

const Chevron = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m9 6 6 6-6 6" />
  </svg>
)

const textClass = (active) =>
  `text-xs font-semibold uppercase tracking-wider transition ${
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

  const [tab, setTab] = useState('men')
  const [drawerTerm, setDrawerTerm] = useState('')

  // Close the mobile menu and search bar after navigating
  useEffect(() => { setOpen(false); setSearchOpen(false) }, [location.pathname, location.search])

  // Mobile drawer: pick the tab for the current page, lock page scroll, close on Escape
  useEffect(() => {
    if (!open) return
    setTab(location.pathname === '/shop-women' ? 'women' : 'men')
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey) }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const submitDrawerSearch = (e) => {
    e.preventDefault()
    const q = drawerTerm.trim()
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/search')
    setDrawerTerm('')
    setOpen(false)
  }

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
    <>
    <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/90 backdrop-blur">
      <AnnouncementBar />
      <nav className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-3 sm:px-6">
        {/* Left: links (desktop) / menu + search buttons (mobile) */}
        <div className="flex items-center gap-4 md:gap-6">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-ink/70 hover:text-brand md:hidden"
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setSearchOpen((o) => !o)}
            className={`md:hidden transition ${searchOpen || location.pathname === '/search' ? 'text-brand' : 'text-ink/70 hover:text-brand'}`}
            aria-label={searchOpen ? 'Close search' : 'Search products'}
            aria-expanded={searchOpen}
          >
            <SearchIcon />
          </button>
          <div className="hidden items-center gap-6 md:flex">
            {LINKS.map((l) => (
              <Link key={l.to} to={l.to} className={textClass(isActive(l.to))}>{l.label}</Link>
            ))}
          </div>
        </div>

        {/* Center: logo */}
        <Link to="/" aria-label="ZUNO home" className="justify-self-center"><Logo wordmarkClass="font-['Exo_2'] font-bold italic" /></Link>

        {/* Right: search + account + wishlist + cart */}
        <div className="flex items-center justify-end gap-4 sm:gap-6">
          <button
            type="button"
            onClick={() => setSearchOpen((o) => !o)}
            className={`hidden md:block transition ${searchOpen || location.pathname === '/search' ? 'text-brand' : 'text-ink/70 hover:text-brand'}`}
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
          <NavLink to="/wishlist" className={(s) => `hidden md:block ${iconClass(s)}`} aria-label={`Wishlist, ${wishlistCount} items`}>
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

    </header>

    {/* Mobile menu: full-screen drawer (outside <header> so backdrop-blur doesn't trap position:fixed) */}
    <div
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      inert={!open}
      className={`fixed inset-0 z-50 flex flex-col bg-white transition-transform duration-300 md:hidden ${open ? 'translate-x-0' : '-translate-x-full'}`}
    >
      {/* Top row: close + wishlist */}
      <div className="flex items-center justify-between px-4 py-3">
        <button type="button" onClick={() => setOpen(false)} className="text-ink/70 hover:text-brand" aria-label="Close menu">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <NavLink to="/wishlist" className={iconClass} aria-label={`Wishlist, ${wishlistCount} items`}>
          <span className="relative block">
            <HeartIcon className="h-6 w-6" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-2 rounded-full bg-brand px-1.5 text-[10px] leading-4 text-white">{wishlistCount}</span>
            )}
          </span>
        </NavLink>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Search */}
        <form onSubmit={submitDrawerSearch} role="search" className="px-4">
          <label className="relative block">
            <span className="sr-only">Search products</span>
            <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-ink/40"><SearchIcon className="h-5 w-5" /></span>
            <input
              type="search"
              value={drawerTerm}
              onChange={(e) => setDrawerTerm(e.target.value)}
              placeholder="What are you looking for?"
              className="w-full rounded-full border-2 border-neutral-200 py-2.5 pr-4 pl-11 outline-none focus:border-brand"
            />
          </label>
        </form>

        {/* Tabs */}
        <div role="tablist" className="mx-4 mt-5 flex gap-6 border-b border-neutral-200">
          {Object.entries(MENU).map(([key, m]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={`-mb-px border-b-2 pb-2 text-sm font-semibold uppercase tracking-wider transition ${
                tab === key ? 'border-ink text-ink' : 'border-transparent text-ink/50 hover:text-ink'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Swipeable image cards */}
        <div className="mt-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none]">
          {MENU[tab].cards.map((c) => (
            <Link key={c.label} to={c.to} className="relative block aspect-[4/5] w-[75%] shrink-0 snap-start overflow-hidden rounded-lg bg-neutral-100">
              <img src={c.img} alt="" loading="lazy" className="h-full w-full object-cover" />
              <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0" />
              <span className="absolute bottom-4 left-4 text-lg font-bold uppercase tracking-wide text-white">{c.label}</span>
            </Link>
          ))}
        </div>

        {/* Link list */}
        <ul className="mt-4 px-4">
          {MENU[tab].links.map((l) => (
            <li key={l.to + l.label}>
              <Link to={l.to} className="flex items-center justify-between py-3.5 font-semibold text-ink hover:text-brand">
                {l.label}
                <Chevron />
              </Link>
            </li>
          ))}
          <li>
            <Link to="/design" className="flex items-center justify-between py-3.5 font-semibold text-brand">
              Create Your Own Tee
              <Chevron />
            </Link>
          </li>
        </ul>

        {/* Secondary links */}
        <ul className="mt-4 border-t border-neutral-200 px-4 py-4">
          {SECONDARY.map((l) => (
            <li key={l.to}>
              <Link to={l.to} className="block py-2 text-sm text-ink/70 hover:text-brand">{l.label}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
    </>
  )
}
