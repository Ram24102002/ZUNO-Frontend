import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ProductSkeleton } from '../components/Skeleton'
import ProductImage from '../components/ProductImage'
import ProductCard from '../components/ProductCard'
import HeartButton from '../components/HeartButton'
import Reviews from '../components/Reviews'
import { Stars } from '../components/Stars'
import { useCart } from '../cart'
import { api } from '../api'

const optionClass = (selected) =>
  `h-11 rounded-lg border-2 px-4 text-sm font-semibold transition active:scale-95 ${
    selected ? 'border-brand bg-brand text-white' : 'border-neutral-200 hover:border-brand'
  }`

export default function Product() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [activeImage, setActiveImage] = useState(0)
  const [color, setColor] = useState(null)
  const [size, setSize] = useState(null)
  const [added, setAdded] = useState(false)
  const [hint, setHint] = useState(null)
  const cart = useCart()
  const buyButton = useRef(null)
  const options = useRef(null)

  useEffect(() => {
    // Also runs when a related product is opened from this page
    setNotFound(false)
    setAdded(false)
    setHint(null)
    api(`/products/${id}`)
      .then((p) => {
        setProduct(p)
        setActiveImage(0)
        setColor(p.colors.length === 1 ? p.colors[0] : null)
        setSize(null)
      })
      .catch(() => setNotFound(true))
  }, [id])

  if (notFound) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-24 text-center">
        <p className="text-ink/60">Product not found.</p>
        <Link to="/" className="mt-4 inline-block font-semibold text-brand">Back to shop</Link>
      </div>
    )
  }
  if (!product) return <ProductSkeleton />

  const images = product.images ?? []
  const choice = [color, size && `Size ${size}`].filter(Boolean).join(' · ')
  // Stock is kept per colour and size; before a colour is chosen, a size counts if any colour has it
  const inStock = (s, c = color) => product.variants.some((v) => v.size === s && (!c || v.color === c) && v.inStock)
  const chooseColor = (c) => {
    setColor(c)
    if (size && !inStock(size, c)) setSize(null)
    setAdded(false)
  }
  const addToCart = () => {
    if (!color || !size) return setHint('Please choose a colour and a size.')
    if (!inStock(size)) return setHint(`Size ${size} is sold out in ${color}.`)
    cart.add({ productId: product.id, name: product.name, color, size, unitPrice: product.price, image: images[0] })
    setHint(null)
    setAdded(true)
  }
  // From the sticky bar: if a choice is missing, take the shopper up to the options first
  const quickAdd = () => {
    if (!color || !size) options.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    addToCart()
  }

  return (
    <>
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-2">
        <div>
          {images.length > 1 && <MobileGallery product={product} images={images} onChange={setActiveImage} />}
          <div className={images.length > 1 ? 'hidden md:block' : ''}>
          {/* Keyed so the new photo fades in when a thumbnail is picked */}
          <ProductImage key={activeImage} product={product} src={images[activeImage]} className="fade-in aspect-[4/5] rounded-2xl" />
          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-3">
              {images.map((src, i) => (
                <button
                  key={src}
                  onClick={() => setActiveImage(i)}
                  aria-label={`Show photo ${i + 1}`}
                  className={`overflow-hidden rounded-lg border-2 transition ${
                    i === activeImage ? 'border-brand' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <ProductImage product={product} src={src} className="aspect-[4/5]" />
                </button>
              ))}
            </div>
          )}
          </div>
        </div>

        <div className="md:py-6">
          <Link to="/" className="text-sm font-medium text-ink/60 hover:text-brand">← Back to shop</Link>
          <div className="mt-4 flex items-start justify-between gap-4">
            <h1 className="display text-4xl">{product.name}</h1>
            <HeartButton product={product} className="mt-1 rounded-full border-2 border-neutral-200 p-2.5 hover:border-red-300" iconClass="h-6 w-6" />
          </div>
          {product.rating.count > 0 && (
            <a href="#reviews" className="mt-2 inline-flex items-center gap-2 text-sm text-ink/70 hover:text-brand">
              <Stars value={product.rating.average} /> {product.rating.average} · {product.rating.count} review{product.rating.count === 1 ? '' : 's'}
            </a>
          )}
          <p className="mt-4 text-3xl font-bold text-brand">₹{product.price}</p>
          <p className="mt-6 leading-relaxed text-ink/80">{product.description}</p>

          <div ref={options} className="scroll-mt-24">
          <div className="mt-8">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider">Colour</p>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((c) => (
                <button key={c} onClick={() => chooseColor(c)} className={optionClass(color === c)}>{c}</button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider">Size</p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => { setSize(s); setAdded(false) }}
                  disabled={!inStock(s)}
                  aria-label={inStock(s) ? `Size ${s}` : `Size ${s}, sold out`}
                  className={`${optionClass(size === s)} w-14 px-0 disabled:cursor-not-allowed disabled:border-neutral-100 disabled:text-ink/30 disabled:line-through`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          </div>

          {product.soldOut ? (
            <p className="mt-8 rounded-full bg-neutral-100 py-4 text-center text-sm font-semibold uppercase text-ink/60">
              Sold out
            </p>
          ) : (
            <button
              ref={buyButton}
              onClick={addToCart}
              className="mt-8 block w-full rounded-full bg-brand py-4 text-center text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark active:scale-[0.98]"
            >
              Add to cart{choice ? ` · ${choice}` : ''}
            </button>
          )}
          {hint && <p key={hint} role="alert" className="fade-up mt-3 text-center text-sm text-red-500">{hint}</p>}
          {added && (
            <p role="status" className="fade-up mt-3 text-center text-sm">
              Added to your cart. <Link to="/cart" className="font-semibold text-brand">View cart</Link>
            </p>
          )}
        </div>
      </div>

      <Reviews key={product.id} slug={product.id} />

      {product.related?.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-20">
          <h2 className="display mb-8 text-3xl">You may also <span className="text-brand">like</span></h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {product.related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {!product.soldOut && (
        <StickyBuyBar
          target={buyButton}
          price={product.price}
          choice={choice}
          added={added}
          onAdd={quickAdd}
        />
      )}
    </>
  )
}

/** Phones: full-width photos you swipe through, with dots showing which one is in view. */
function MobileGallery({ product, images, onChange }) {
  const [index, setIndex] = useState(0)
  const navigate = useNavigate()
  // Back to wherever the shopper came from; straight to the shop if they landed here directly
  const back = () => (window.history.state?.idx > 0 ? navigate(-1) : navigate('/'))
  const onScroll = (e) => {
    const el = e.currentTarget
    const i = Math.round(el.scrollLeft / el.clientWidth)
    if (i !== index) {
      setIndex(i)
      onChange(i)
    }
  }

  return (
    <div className="relative -mx-4 -mt-12 md:hidden">
      <div
        onScroll={onScroll}
        className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label={`${product.name} photos`}
      >
        {images.map((src, i) => (
          <div key={src} className="w-full shrink-0 snap-center" aria-label={`Photo ${i + 1} of ${images.length}`}>
            <ProductImage product={product} src={src} className="aspect-[4/5]" />
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={back}
        aria-label="Back"
        className="absolute top-4 left-4 rounded-full bg-white/90 p-2.5 shadow-sm backdrop-blur transition active:scale-90"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>
      <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center gap-1.5" aria-hidden="true">
        {images.map((src, i) => (
          <span
            key={src}
            className={`h-1.5 rounded-full bg-white shadow transition-all duration-300 ${i === index ? 'w-5' : 'w-1.5 opacity-60'}`}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * Phones: price + "Add to cart" pinned to the bottom of the screen whenever the page's own button is out of view.
 * Rendered into <body> so the page-entrance animation on <main> can't shift a position:fixed bar.
 */
function StickyBuyBar({ target, price, choice, added, onAdd }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const el = target.current
    if (!el || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(([entry]) => setShow(!entry.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [target])

  return createPortal(
    <>
      {/* Room at the end of the page so the bar never hides the footer */}
      <div className="h-20 md:hidden" aria-hidden="true" />
      <div
        inert={!show}
        className={`fixed inset-x-0 bottom-0 z-20 border-t border-neutral-200 bg-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur transition-transform duration-300 ease-[cubic-bezier(0.2,0.7,0.2,1)] md:hidden ${show ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="flex items-center gap-4">
          <div className="min-w-0">
            <p className="text-lg font-bold leading-tight text-brand">₹{price}</p>
            <p className="truncate text-xs text-ink/60">{choice || 'Choose colour & size'}</p>
          </div>
          {added ? (
            <Link
              to="/cart"
              className="fade-in ml-auto shrink-0 rounded-full bg-ink px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition active:scale-95"
            >
              View cart ✓
            </Link>
          ) : (
            <button
              type="button"
              onClick={onAdd}
              className="ml-auto shrink-0 rounded-full bg-brand px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-brand/30 transition active:scale-95"
            >
              Add to cart
            </button>
          )}
        </div>
      </div>
    </>,
    document.body,
  )
}
