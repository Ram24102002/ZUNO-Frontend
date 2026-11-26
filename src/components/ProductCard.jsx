import { Link } from 'react-router-dom'
import ProductImage from './ProductImage'
import HeartButton from './HeartButton'
import { Stars } from './Stars'

/** `swipe`: on phones, slide sideways to the second photo. Turn off inside rows that already scroll sideways. */
export default function ProductCard({ product, swipe = true }) {
  const hoverImage = product.images?.[1]
  const to = `/product/${product.id}`

  return (
    <div className="group">
      <div className="relative">
        <Link to={to} className="block overflow-hidden rounded-2xl transition duration-200 active:scale-[0.97]" tabIndex={-1} aria-hidden="true">
          {/* Phones: swipe to the second photo (hover does nothing on touch) */}
          {swipe && hoverImage && (
            <div className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden">
              <ProductImage product={product} className="aspect-[4/5] shrink-0 snap-center" />
              <ProductImage product={product} src={hoverImage} className="aspect-[4/5] shrink-0 snap-center" />
            </div>
          )}
          <div className={`relative ${swipe && hoverImage ? 'hidden md:block' : ''}`}>
            <ProductImage product={product} className="aspect-[4/5] transition duration-500 group-hover:scale-105" />
            {/* Second photo fades in on hover */}
            {hoverImage && (
              <ProductImage
                product={product}
                src={hoverImage}
                className="absolute inset-0 aspect-[4/5] opacity-0 transition duration-500 group-hover:opacity-100"
              />
            )}
          </div>
        </Link>
        {product.tag && (
          <span className="pointer-events-none absolute top-3 left-3 rounded-full bg-brand px-3 py-1 text-xs font-semibold uppercase text-white">
            {product.tag}
          </span>
        )}
        {product.soldOut && (
          <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-ink px-3 py-1 text-xs font-semibold uppercase text-white">
            Sold out
          </span>
        )}
        {/* Heart sits over the photo but outside the link, so tapping it doesn't open the product */}
        <HeartButton product={product} className="absolute top-3 right-3 rounded-full bg-white/90 p-2 shadow-sm" />
      </div>
      <Link to={to} className="mt-3 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-[11px] font-semibold group-hover:text-brand sm:text-sm">{product.name}</h3>
          <p className="text-sm text-ink/60">
            {product.colors.length > 1 ? `${product.colors.length} colours` : product.colors[0]}
          </p>
          {product.rating?.count > 0 && (
            <p className="mt-1 flex items-center gap-1 text-xs text-ink/60">
              <Stars value={product.rating.average} className="h-3.5 w-3.5" /> ({product.rating.count})
            </p>
          )}
        </div>
        <p className="text-lg font-bold">₹{product.price}</p>
      </Link>
    </div>
  )
}
