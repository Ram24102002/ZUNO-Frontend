import { Link, NavLink } from 'react-router-dom'
import Logo from './Logo'
import { useCart } from '../cart'
import { useAccount } from '../account'

const linkClass = ({ isActive }) =>
  `text-xs font-semibold uppercase transition sm:text-sm sm:tracking-wider ${
    isActive ? 'text-brand' : 'text-ink/70 hover:text-brand'
  }`

export default function Navbar() {
  const { count } = useCart()
  const { customer } = useAccount()
  return (
    <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-3 sm:px-4">
        <Link to="/" aria-label="ZUNO home"><Logo /></Link>
        <div className="flex items-center gap-2.5 sm:gap-6">
          <NavLink to="/" end className={linkClass}>Shop</NavLink>
          <NavLink to="/design" className={linkClass}>Create</NavLink>
          <NavLink to="/about" className={linkClass}>About</NavLink>
          <NavLink to="/account" className={linkClass} aria-label={customer ? `Your account, ${customer.firstName}` : 'Log in'}>
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          </NavLink>
          <NavLink to="/cart" className={linkClass} aria-label={`Cart, ${count} items`}>
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
    </header>
  )
}
