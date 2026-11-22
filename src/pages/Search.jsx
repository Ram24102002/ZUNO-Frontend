import { useEffect, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { api } from '../api'

const SORTS = [
  ['featured', 'Featured'],
  ['newest', 'Newest'],
  ['price-asc', 'Price: low to high'],
  ['price-desc', 'Price: high to low'],
  ['rating', 'Top rated'],
]
const FILTER_KEYS = ['q', 'category', 'color', 'size', 'max_price', 'sort']

const optionClass = (active) =>
  `rounded-full border-2 px-3 py-1 text-sm font-semibold transition ${
    active ? 'border-brand bg-brand text-white' : 'border-neutral-200 hover:border-brand'
  }`

function Group({ title, children }) {
  return (
    <div className="border-b border-neutral-200 py-5 first:pt-0">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-ink/60">{title}</h3>
      {children}
    </div>
  )
}

/** /search?q=… : results grid with filters in a left sidebar. Filters live in the URL. */
export default function Search() {
  const [params, setParams] = useSearchParams()
  const [options, setOptions] = useState(null) // { categories, colors, sizes, price: { min, max } }
  const [products, setProducts] = useState(null)
  const [error, setError] = useState(null)
  const [showFilters, setShowFilters] = useState(false) // mobile drawer
  // Set when we got here from the camera button; changing a filter drops it
  const imageSearch = useLocation().state?.imageSearch

  const filters = Object.fromEntries(FILTER_KEYS.map((k) => [k, params.get(k) ?? '']))
  const filterString = new URLSearchParams(Object.entries(filters).filter(([, v]) => v)).toString()

  const setFilter = (key, value) =>
    setParams((current) => {
      const next = new URLSearchParams(current)
      if (value) next.set(key, value)
      else next.delete(key)
      return next
    }, { replace: true, preventScrollReset: true })

  // Keep the search term, drop everything else
  const clearFilters = () => setParams(filters.q ? { q: filters.q } : {}, { replace: true, preventScrollReset: true })

  useEffect(() => {
    api('/filters').then(setOptions).catch(() => {})
  }, [])

  useEffect(() => {
    let current = true
    setProducts(null)
    api(`/products${filterString ? `?${filterString}` : ''}`)
      .then((list) => { if (current) { setProducts(list); setError(null) } })
      .catch(() => current && setError('Could not load products. Is the server running?'))
    return () => { current = false }
  }, [filterString])

  const activeCount = ['category', 'color', 'size', 'max_price'].filter((k) => filters[k]).length

  const sidebar = options && (
    <div>
      <Group title="Category">
        <ul className="space-y-2 text-sm">
          {[{ slug: '', name: 'All' }, ...options.categories].map((c) => (
            <li key={c.slug || 'all'}>
              <button
                onClick={() => setFilter('category', c.slug)}
                className={`font-semibold transition ${filters.category === c.slug ? 'text-brand' : 'text-ink/70 hover:text-brand'}`}
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </Group>

      {options.colors.length > 0 && (
        <Group title="Colour">
          <div className="flex flex-wrap gap-2">
            {options.colors.map((c) => (
              <button key={c} onClick={() => setFilter('color', filters.color === c ? '' : c)} className={optionClass(filters.color === c)}>
                {c}
              </button>
            ))}
          </div>
        </Group>
      )}

      {options.sizes.length > 0 && (
        <Group title="Size">
          <div className="flex flex-wrap gap-2">
            {options.sizes.map((s) => (
              <button key={s} onClick={() => setFilter('size', filters.size === s ? '' : s)} className={`${optionClass(filters.size === s)} min-w-11`}>
                {s}
              </button>
            ))}
          </div>
        </Group>
      )}

      {options.price.max > options.price.min && (
        <Group title="Price">
          <p className="text-sm font-semibold">Up to ₹{filters.max_price || options.price.max}</p>
          <input
            type="range"
            min={options.price.min}
            max={options.price.max}
            step={50}
            value={filters.max_price || options.price.max}
            onChange={(e) => setFilter('max_price', Number(e.target.value) >= options.price.max ? '' : e.target.value)}
            className="mt-3 block w-full accent-brand"
            aria-label="Maximum price"
          />
          <div className="mt-1 flex justify-between text-xs text-ink/50">
            <span>₹{options.price.min}</span>
            <span>₹{options.price.max}</span>
          </div>
        </Group>
      )}

      {activeCount > 0 && (
        <button onClick={clearFilters} className="mt-5 text-sm font-semibold text-brand hover:underline">Clear filters</button>
      )}
    </div>
  )

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand">Search</p>
        <h1 className="display mt-2 text-3xl sm:text-4xl">
          {imageSearch ? 'Similar to your photo' : filters.q ? <>Results for “<span className="text-brand">{filters.q}</span>”</> : 'All products'}
        </h1>
        {imageSearch && (
          <div className="mt-5 flex items-center gap-4 rounded-2xl bg-neutral-50 p-3 pr-5">
            <img src={imageSearch.preview} alt="Your photo" onError={(e) => { e.currentTarget.style.display = 'none' }} className="h-16 w-16 shrink-0 rounded-xl object-cover" />
            <p className="text-sm text-ink/70">
              {imageSearch.q || imageSearch.color
                ? <>We spotted: <span className="font-semibold text-ink">{[imageSearch.color, imageSearch.q].filter(Boolean).join(' ')}</span></>
                : 'We couldn’t recognise clothing in that photo, so here’s everything.'}
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-10">
        {/* Left: filters (desktop) */}
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-28">{sidebar}</div>
        </aside>

        {/* Right: toolbar + results */}
        <div className="min-w-0 flex-1">
          <div className="mb-6 flex items-center justify-between gap-4">
            <p className="text-sm text-ink/60">
              {products ? `${products.length} ${products.length === 1 ? 'product' : 'products'}` : 'Searching…'}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(true)}
                className="rounded-full border-2 border-neutral-200 px-4 py-1.5 text-sm font-semibold hover:border-brand lg:hidden"
              >
                Filters{activeCount ? ` · ${activeCount}` : ''}
              </button>
              <label className="text-sm font-semibold">
                <span className="sr-only">Sort by</span>
                <select
                  value={filters.sort || 'featured'}
                  onChange={(e) => setFilter('sort', e.target.value === 'featured' ? '' : e.target.value)}
                  className="rounded-lg border-2 border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand"
                >
                  {SORTS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
            </div>
          </div>

          {error && <p className="text-red-500">{error}</p>}
          {products?.length === 0 && (
            <div className="rounded-2xl bg-neutral-50 py-16 text-center">
              <p className="text-ink/60">No products match{filters.q ? ` “${filters.q}”` : ''}.</p>
              {activeCount > 0 && <button onClick={clearFilters} className="mt-3 font-semibold text-brand">Clear filters</button>}
            </div>
          )}
          <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {products?.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-20 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowFilters(false)} />
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw] overflow-y-auto bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold">Filters</h2>
              <button onClick={() => setShowFilters(false)} className="text-sm font-semibold text-brand">Done</button>
            </div>
            {sidebar}
          </div>
        </div>
      )}
    </section>
  )
}
