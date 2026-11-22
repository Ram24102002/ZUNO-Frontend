import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Shop from '../components/Shop'
import { ClawMark } from '../components/Logo'
import Lookbook from '../components/Lookbook'
import DropHero from '../components/DropHero'
import ProductCard from '../components/ProductCard'
import { api } from '../api'

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-light to-white">
        <ClawMark className="pointer-events-none absolute -top-10 -left-16 h-72 w-72 opacity-15" />
        <ClawMark className="pointer-events-none absolute -right-10 -bottom-16 h-80 w-80 opacity-20" />
        <div className="relative mx-auto max-w-6xl px-4 py-24 text-center sm:py-36">
          <h1 className="display text-5xl text-ink sm:text-7xl lg:text-8xl">
            Wear your <span className="text-brand">mindset.</span>
          </h1>
          <p className="mt-6 text-sm text-ink/80 sm:text-base">Limited stock. No restocks.</p>
          <a
            href="#shop"
            className="mt-8 inline-block rounded-full bg-brand px-10 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark"
          >
            Shop drop
          </a>
        </div>
      </section>

      {/* Design your own tee */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand to-brand-dark px-6 py-14 text-center text-white sm:px-12 sm:text-left">
          <div className="relative flex flex-col items-center gap-8 sm:flex-row sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/80">New · Custom prints</p>
              <h2 className="display mt-3 text-4xl sm:text-5xl">
                Design your own <span className="text-ink">tee.</span>
              </h2>
              <p className="mt-4 max-w-md text-white/85">
                Upload your artwork, place it on the T-shirt and send it to us. We print it for you.
              </p>
            </div>
            <Link
              to="/design"
              className="shrink-0 rounded-full bg-white px-8 py-3 text-sm font-semibold uppercase tracking-wider text-brand-dark shadow-lg transition hover:bg-brand-light"
            >
              Start designing
            </Link>
          </div>
        </div>
      </section>

      <DropHero />

      <BestSellers />

      <Shop title={<>Current <span className="text-brand">Drop</span></>} compact />

      {/* Brand statement */}
      <section className="relative overflow-hidden py-24 text-center">
        <ClawMark className="pointer-events-none absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 opacity-10" />
        <div className="relative mx-auto max-w-3xl px-4">
          <p className="text-xs font-bold uppercase tracking-widest text-ink/60">From zero to number one</p>
          <p className="display mt-4 text-3xl leading-tight sm:text-4xl">
            ZUNO is not just clothing.
            <br />
            It's a <span className="text-brand">mindset</span>.
          </p>
          <p className="mt-6 text-sm font-light uppercase tracking-wider text-ink/70 sm:text-base">
            We create limited collections for those who refuse to blend in. Every drop tells a story. Every piece
            makes a statement.
          </p>
        </div>
      </section>

      <Lookbook />
    </>
  )
}

/** Up to 12 best-rated products in a row that scrolls sideways (four visible on desktop). */
function BestSellers() {
  const [products, setProducts] = useState(null)

  useEffect(() => {
    api('/products?sort=rating').then((list) => setProducts(list.slice(0, 12))).catch(() => setProducts([]))
  }, [])

  if (products?.length === 0) return null

  return (
    <section className="mx-auto max-w-6xl px-4 pt-20">
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <h2 className="text-2xl font-bold uppercase">Best for sale</h2>
        <a href="#shop" className="text-sm text-brand underline underline-offset-2 hover:text-brand-dark">
          View all
        </a>
      </div>
      <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-4 lg:gap-6">
        {products?.map((p) => (
          <div key={p.id} className="w-[46%] shrink-0 snap-start sm:w-[31%] lg:w-[calc(25%-18px)]">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  )
}
