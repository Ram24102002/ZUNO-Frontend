import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from './ProductCard'
import { api } from '../api'

const SORTS = [
  ['featured', 'Featured'],
  ['newest', 'Newest'],
  ['price-asc', 'Price: low to high'],
  ['price-desc', 'Price: high to low'],
  ['rating', 'Top rated'],
]
const FILTER_KEYS = ['q', 'category', 'color', 'size', 'max_price', 'sort']

const chipClass = (active) =>
  `shrink-0 rounded-full border-2 px-4 py-1.5 text-sm font-semibold transition ${
    active ? 'border-brand bg-brand text-white' : 'border-neutral-200 hover:border-brand'
  }`
const selectClass = 'rounded-lg border-2 border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand'

/** "The Collection": search, category chips, filters and the product grid. Filters live in the URL. */
export default function Shop() {
  const [params, setParams] = useSearchParams()
  const [options, setOptions] = useState(null) // { categories, colors, sizes, price: { min, max } }
  const [products, setProducts] = useState(null)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState(params.get('q') ?? '')
  const [showFilters, setShowFilters] = useState(false)

  const filters = Object.fromEntries(FILTER_KEYS.map((k) => [k, params.get(k) ?? '']))
  const filterString = new URLSearchParams(Object.entries(filters).filter(([, v]) => v)).toString()

  const setFilter = (key, value) =>
    setParams((current) => {
      const next = new URLSearchParams(current)
      if (value) next.set(key, value)
      else next.delete(key)
      return next
    }, { replace: true, preventScrollReset: true })

  useEffect(() => {
    api('/filters').then(setOptions).catch(() => {})
  }, [])

  // Typing waits a moment before searching
  useEffect(() => {
    const timer = setTimeout(() => { if (query.trim() !== filters.q) setFilter('q', query.trim()) }, 300)
    return () => clearTimeout(timer)
  }, [query]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let current = true
    api(`/products${filterString ? `?${filterString}` : ''}`)
      .then((list) => { if (current) { setProducts(list); setError(null) } })
      .catch(() => current && setError('Could not load products. Is the server running?'))
    return () => { current = false }
  }, [filterString])

  const activeFilters = ['color', 'size', 'max_price'].filter((k) => filters[k]).length
  const anyFilter = FILTER_KEYS.some((k) => k !== 'sort' && filters[k])
  const clearAll = () => {
    setQuery('')
    setParams({}, { replace: true, preventScrollReset: true })
  }

  return (
    <section id="shop" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="display text-4xl">
          The <span className="text-brand">Collection</span>
        </h2>
        <label className="relative block sm:w-72">
          <span className="sr-only">Search the collection</span>
          <svg viewBox="0 0 24 24" className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-ink/40" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tees, colours…"
            className="w-full rounded-full border-2 border-neutral-200 py-2.5 pr-4 pl-10 outline-none focus:border-brand"
          />
        </label>
      </div>

      <div className="mb-8 space-y-4">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFilter('category', '')} className={chipClass(!filters.category)}>All</button>
          {options?.categories.map((c) => (
            <button key={c.slug} onClick={() => setFilter('category', c.slug)} className={chipClass(filters.category === c.slug)}>
              {c.name}
            </button>
          ))}
          <button
            onClick={() => setShowFilters((s) => !s)}
            aria-expanded={showFilters}
            className={`${chipClass(showFilters)} ml-auto`}
          >
            Filters{activeFilters ? ` · ${activeFilters}` : ''}
          </button>
        </div>

        {showFilters && options && (
          <div className="flex flex-wrap items-end gap-4 rounded-2xl bg-neutral-50 p-4">
            <label className="text-sm font-semibold">
              Colour
              <select value={filters.color} onChange={(e) => setFilter('color', e.target.value)} className={`${selectClass} mt-1 block`}>
                <option value="">Any</option>
                {options.colors.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold">
              Size
              <select value={filters.size} onChange={(e) => setFilter('size', e.target.value)} className={`${selectClass} mt-1 block`}>
                <option value="">Any</option>
                {options.sizes.map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>
            {options.price.max > options.price.min && (
              <label className="text-sm font-semibold">
                Max price · ₹{filters.max_price || options.price.max}
                <input
                  type="range"
                  min={options.price.min}
                  max={options.price.max}
                  step={50}
                  value={filters.max_price || options.price.max}
                  onChange={(e) => setFilter('max_price', Number(e.target.value) >= options.price.max ? '' : e.target.value)}
                  className="mt-3 block w-48 accent-brand"
                />
              </label>
            )}
            <label className="text-sm font-semibold">
              Sort
              <select value={filters.sort || 'featured'} onChange={(e) => setFilter('sort', e.target.value === 'featured' ? '' : e.target.value)} className={`${selectClass} mt-1 block`}>
                {SORTS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            {anyFilter && (
              <button onClick={clearAll} className="py-2 text-sm font-semibold text-brand hover:underline">Clear all</button>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-red-500">{error}</p>}
      {products?.length === 0 && (
        <div className="rounded-2xl bg-neutral-50 py-16 text-center">
          <p className="text-ink/60">Nothing matches that yet.</p>
          <button onClick={clearAll} className="mt-3 font-semibold text-brand">Show everything</button>
        </div>
      )}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {products?.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  )
}
