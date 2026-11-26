import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import Logo from './Logo'
import AnnouncementBar from './AnnouncementBar'
import { useCart } from '../cart'
import { useAccount } from '../account'
import { useWishlist } from '../wishlist'
import { HeartIcon } from './HeartButton'
import ImageSearchButton from './ImageSearchButton'

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

// Pages whose hero sits under a see-through navbar while scrolled to the top.
// 'dark' heroes need white nav text; 'light' ones keep the normal colours.
const HERO_PAGES = { '/': 'light', '/shop-men': 'dark', '/shop-women': 'dark', '/contact': 'dark' }

const idle = (dark) => (dark ? 'text-white/90 hover:text-white' : 'text-ink/70 hover:text-brand')

const textClass = (active, dark = false) =>
  `text-xs font-semibold uppercase tracking-wider transition ${active ? 'text-brand' : idle(dark)}`

const SearchIcon = ({ className = 'h-6 w-6' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
)

const iconClass = (dark = false) => ({ isActive }) => `transition ${isActive ? 'text-brand' : idle(dark)}`

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

  // Transparent over the hero while at the very top of a hero page
  const [atTop, setAtTop] = useState(true)
  useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY < 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  const hero = HERO_PAGES[location.pathname]
  const clear = Boolean(hero) && atTop && !searchOpen
  const dark = clear && hero === 'dark'

  // Share the nav's height so hero pages can slide up underneath it (see .under-nav in index.css)
  const navRef = useRef(null)
  useEffect(() => {
    const el = navRef.current
    const ro = new ResizeObserver(() => document.documentElement.style.setProperty('--nav-h', `${el.offsetHeight}px`))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

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
    <header className={`sticky top-0 z-10 border-b transition-colors duration-300 ${clear ? 'border-transparent bg-transparent' : 'border-neutral-200 bg-white/90 backdrop-blur'}`}>
      <AnnouncementBar />
      <nav ref={navRef} className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-3 sm:px-6">
        {/* Left: links (desktop) / menu + search buttons (mobile) */}
        <div className="flex items-center gap-4 md:gap-6">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className={`md:hidden transition ${idle(dark)}`}
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
            className={`md:hidden transition ${searchOpen || location.pathname === '/search' ? 'text-brand' : idle(dark)}`}
            aria-label={searchOpen ? 'Close search' : 'Search products'}
            aria-expanded={searchOpen}
          >
            <SearchIcon />
          </button>
          <div className="hidden items-center gap-6 md:flex">
            {LINKS.map((l) => (
              <Link key={l.to} to={l.to} className={textClass(isActive(l.to), dark)}>{l.label}</Link>
            ))}
          </div>
        </div>

        {/* Center: logo */}
        <Link to="/" aria-label="ZUNO home" className="justify-self-center logo-weight"><Logo wordmarkClass={`font-['Exo_2'] font-bold italic transition-colors ${dark ? 'text-white!' : ''}`} /></Link>

        {/* Right: search + account + wishlist + cart */}
        <div className="flex items-center justify-end gap-4 sm:gap-6">
          <button
            type="button"
            onClick={() => setSearchOpen((o) => !o)}
            className={`hidden md:block transition ${searchOpen || location.pathname === '/search' ? 'text-brand' : idle(dark)}`}
            aria-label={searchOpen ? 'Close search' : 'Search products'}
            aria-expanded={searchOpen}
          >
            <SearchIcon />
          </button>
          <NavLink to="/account" className={iconClass(dark)} aria-label={customer ? `Your account, ${customer.firstName}` : 'Log in'}>
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          </NavLink>
          <NavLink to="/wishlist" className={(s) => `hidden md:block ${iconClass(dark)(s)}`} aria-label={`Wishlist, ${wishlistCount} items`}>
            <span className="relative block">
              <HeartIcon className="h-6 w-6" />
              {wishlistCount > 0 && (
                <span key={wishlistCount} className="pop absolute -top-1.5 -right-2 rounded-full bg-brand px-1.5 text-[10px] leading-4 text-white">{wishlistCount}</span>
              )}
            </span>
          </NavLink>
          <NavLink to="/cart" className={iconClass(dark)} aria-label={`Cart, ${count} items`}>
            <span className="relative block">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 8h12l1 12H5L6 8z" />
                <path d="M9 8V6a3 3 0 0 1 6 0v2" />
              </svg>
              {count > 0 && (
                <span key={count} className="pop absolute -top-1.5 -right-2 rounded-full bg-brand px-1.5 text-[10px] leading-4 text-white">{count}</span>
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
                className="w-full rounded-full border-2 border-neutral-200 py-2.5 pr-12 pl-11 outline-none focus:border-brand"
              />
              <ImageSearchButton className="absolute top-1/2 right-4 -translate-y-1/2" tabIndex={searchOpen ? 0 : -1} />
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
      className={`fixed inset-0 z-50 flex flex-col bg-white transition-transform duration-300 ease-[cubic-bezier(0.2,0.7,0.2,1)] md:hidden ${open ? 'drawer-open translate-x-0' : '-translate-x-full'}`}
    >
      {/* Top row: close + wishlist */}
      <div className="flex items-center justify-between px-4 py-3">
        <button type="button" onClick={() => setOpen(false)} className="text-ink/70 hover:text-brand" aria-label="Close menu">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <NavLink to="/wishlist" className={iconClass()} aria-label={`Wishlist, ${wishlistCount} items`}>
          <span className="relative block">
            <HeartIcon className="h-6 w-6" />
            {wishlistCount > 0 && (
              <span key={wishlistCount} className="pop absolute -top-1.5 -right-2 rounded-full bg-brand px-1.5 text-[10px] leading-4 text-white">{wishlistCount}</span>
            )}
          </span>
        </NavLink>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Search */}
        <form onSubmit={submitDrawerSearch} role="search" className="drawer-item px-4" style={{ '--i': 0 }}>
          <label className="relative block">
            <span className="sr-only">Search products</span>
            <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-ink/40"><SearchIcon className="h-5 w-5" /></span>
            <input
              type="search"
              value={drawerTerm}
              onChange={(e) => setDrawerTerm(e.target.value)}
              placeholder="What are you looking for?"
              className="w-full rounded-full border-2 border-neutral-200 py-2.5 pr-12 pl-11 outline-none focus:border-brand"
            />
            <ImageSearchButton className="absolute top-1/2 right-4 -translate-y-1/2" tabIndex={open ? 0 : -1} />
          </label>
        </form>

        {/* Tabs */}
        <div role="tablist" className="drawer-item mx-4 mt-5 flex gap-6 border-b border-neutral-200" style={{ '--i': 1 }}>
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
        <div className="drawer-item" style={{ '--i': 2 }}>
        <div key={tab} className="fade-in mt-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none]">
          {MENU[tab].cards.map((c) => (
            <Link key={c.label} to={c.to} className="relative block aspect-[4/5] w-[75%] shrink-0 snap-start overflow-hidden rounded-lg bg-neutral-100 transition active:scale-[0.97]">
              <img src={c.img} alt="" loading="lazy" className="h-full w-full object-cover" />
              <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0" />
              <span className="absolute bottom-4 left-4 text-lg font-bold uppercase tracking-wide text-white">{c.label}</span>
            </Link>
          ))}
        </div>
        </div>

        {/* Link list */}
        <ul key={tab} className="fade-in drawer-item mt-4 px-4" style={{ '--i': 3 }}>
          {MENU[tab].links.map((l) => (
            <li key={l.to + l.label}>
              <Link to={l.to} className="flex items-center justify-between py-3.5 font-semibold text-ink transition hover:text-brand active:translate-x-1">
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
        <ul className="drawer-item mt-4 border-t border-neutral-200 px-4 py-4" style={{ '--i': 4 }}>
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
