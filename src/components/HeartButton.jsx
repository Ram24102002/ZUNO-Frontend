import { useWishlist } from '../wishlist'

export function HeartIcon({ filled, className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20s-7-4.4-9.2-9A5 5 0 0 1 12 5.6 5 5 0 0 1 21.2 11C19 15.6 12 20 12 20z" />
    </svg>
  )
}

/** Heart toggle that adds/removes a product from the wishlist. Safe to place inside a <Link>. */
export default function HeartButton({ product, className = '', iconClass = 'h-5 w-5' }) {
  const wishlist = useWishlist()
  const saved = wishlist.has(product.id)

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        wishlist.toggle(product)
      }}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
      className={`transition active:scale-90 ${saved ? 'text-red-500' : 'text-ink/70 hover:text-red-500'} ${className}`}
    >
      <HeartIcon filled={saved} className={iconClass} />
    </button>
  )
}
