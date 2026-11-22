import { Link } from 'react-router-dom'

const PHOTOS = [
  { src: '/images/lookbook/gym.webp', alt: 'Jersey 80 tee at the gym', label: 'In the gym' },
  { src: '/images/lookbook/beach.webp', alt: 'Flame graphic tee at the beach', label: 'By the sea' },
  { src: '/images/lookbook/street.webp', alt: 'Essential polo outdoors', label: 'On the street' },
  { src: '/images/lookbook/city.webp', alt: 'Essential polo in the city', label: 'In the city' },
]

/** "Welcome to the community": real customer / lookbook photos on black. */
export default function Lookbook() {
  return (
    <section className="bg-black py-16 text-white sm:py-20">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <h2 className="display text-3xl sm:text-4xl">
          Welcome to the <span className="text-brand">community</span>
        </h2>
        <p className="mt-2 text-white/80">#WearYourMindset</p>
        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {PHOTOS.map((p) => (
            <figure key={p.src} className="group relative overflow-hidden rounded-2xl">
              <img src={p.src} alt={p.alt} loading="lazy" className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-105" />
              <figcaption className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase text-ink sm:text-xs">
                {p.label}
              </figcaption>
            </figure>
          ))}
        </div>
        <Link to="/about" className="mt-8 inline-block text-brand underline underline-offset-4 hover:text-white">
          Read more…
        </Link>
      </div>
    </section>
  )
}
