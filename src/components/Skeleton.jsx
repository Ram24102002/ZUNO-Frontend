// Grey placeholder shapes shown while products load, so the layout appears at once instead of "Loading…"

const block = 'animate-pulse rounded bg-neutral-200/80'

export function CardSkeleton() {
  return (
    <div aria-hidden="true">
      <div className={`${block} aspect-[4/5] rounded-2xl`} />
      <div className={`${block} mt-3 h-4 w-3/4`} />
      <div className={`${block} mt-2 h-3 w-1/3`} />
    </div>
  )
}

/** `count` card placeholders, for dropping straight into a product grid. */
export function CardSkeletons({ count = 4 }) {
  return Array.from({ length: count }, (_, i) => <CardSkeleton key={i} />)
}

export function ProductSkeleton() {
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-2" role="status" aria-label="Loading product">
      <div className={`${block} -mx-4 -mt-12 aspect-[4/5] rounded-none md:mx-0 md:mt-0 md:rounded-2xl`} />
      <div className="md:py-6">
        <div className={`${block} h-10 w-2/3`} />
        <div className={`${block} mt-4 h-8 w-24`} />
        <div className={`${block} mt-6 h-4 w-full`} />
        <div className={`${block} mt-2 h-4 w-5/6`} />
        <div className="mt-8 flex gap-2">
          {[0, 1, 2, 3].map((i) => <div key={i} className={`${block} h-11 w-14 rounded-lg`} />)}
        </div>
        <div className={`${block} mt-8 h-14 w-full rounded-full`} />
      </div>
    </div>
  )
}
