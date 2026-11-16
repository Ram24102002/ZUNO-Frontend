import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { HeartIcon } from '../components/HeartButton'
import { useWishlist } from '../wishlist'
import { api } from '../api'

export default function Wishlist() {
  const { items, refresh, count } = useWishlist()

  // Update saved prices / stock / photos from the shop once per visit
  useEffect(() => {
    if (count === 0) return
    api('/products')
      .then((products) => refresh(Object.fromEntries(products.map((p) => [p.id, p]))))
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="px-4 py-12 sm:px-10">
      <h1 className="display text-4xl">Your <span className="text-brand">wishlist</span></h1>
      <p className="mt-2 text-sm text-ink/60">
        {count === 0 ? 'Nothing saved yet.' : `${count} item${count === 1 ? '' : 's'} saved on this device.`}
      </p>

      {count === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-2xl bg-neutral-50 py-16 text-center">
          <HeartIcon className="h-10 w-10 text-ink/30" />
          <p className="mt-4 text-ink/70">Tap the heart on any product to save it here.</p>
          <Link to="/" className="mt-6 rounded-full bg-brand px-8 py-3 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-brand-dark">
            Shop the collection
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}
