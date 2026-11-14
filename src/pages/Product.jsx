import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ProductImage from '../components/ProductImage'
import ProductCard from '../components/ProductCard'
import Reviews from '../components/Reviews'
import { Stars } from '../components/Stars'
import { useCart } from '../cart'
import { api } from '../api'

const optionClass = (selected) =>
  `h-11 rounded-lg border-2 px-4 text-sm font-semibold transition ${
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

  useEffect(() => {
    // Also runs when a related product is opened from this page
    window.scrollTo(0, 0)
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
  if (!product) return <p className="py-24 text-center text-ink/50">Loading…</p>

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

  return (
    <>
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-2">
        <div>
          <ProductImage product={product} src={images[activeImage]} className="aspect-[4/5] rounded-2xl" />
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

        <div className="md:py-6">
          <Link to="/" className="text-sm font-medium text-ink/60 hover:text-brand">← Back to shop</Link>
          <h1 className="display mt-4 text-4xl">{product.name}</h1>
          {product.rating.count > 0 && (
            <a href="#reviews" className="mt-2 inline-flex items-center gap-2 text-sm text-ink/70 hover:text-brand">
              <Stars value={product.rating.average} /> {product.rating.average} · {product.rating.count} review{product.rating.count === 1 ? '' : 's'}
            </a>
          )}
          <p className="mt-4 text-3xl font-bold text-brand">₹{product.price}</p>
          <p className="mt-6 leading-relaxed text-ink/80">{product.description}</p>

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

          {product.soldOut ? (
            <p className="mt-8 rounded-full bg-neutral-100 py-4 text-center text-sm font-semibold uppercase text-ink/60">
              Sold out
            </p>
          ) : (
            <button
              onClick={addToCart}
              className="mt-8 block w-full rounded-full bg-brand py-4 text-center text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark"
            >
              Add to cart{choice ? ` · ${choice}` : ''}
            </button>
          )}
          {hint && <p role="alert" className="mt-3 text-center text-sm text-red-500">{hint}</p>}
          {added && (
            <p role="status" className="mt-3 text-center text-sm">
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
    </>
  )
}
