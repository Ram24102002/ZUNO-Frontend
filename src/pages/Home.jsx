import { Link } from 'react-router-dom'
import Shop from '../components/Shop'
import { ClawMark } from '../components/Logo'
import Lookbook from '../components/Lookbook'
import Testimonials from '../components/Testimonials'
import DropHero from '../components/DropHero'

export default function Home() {
  return (
    <>
      <DropHero />

      <section className="relative overflow-hidden bg-gradient-to-b from-brand-light to-white">
        <ClawMark className="pointer-events-none absolute -top-10 -left-16 h-72 w-72 opacity-15" />
        <ClawMark className="pointer-events-none absolute -right-10 -bottom-16 h-80 w-80 opacity-20" />
        <div className="relative mx-auto max-w-6xl px-4 py-24 text-center sm:py-32">
          <span className="inline-block rounded-full bg-brand px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white">
            Drop shoulder · Oversized fit
          </span>
          <h1 className="display mt-6 text-6xl text-ink sm:text-8xl">
            Wear the <span className="text-brand">Mindset.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-md text-ink/70 md:text-xs">
            Oversized T-shirts made for people who move with purpose. Limited first drop.
          </p>
          <a
            href="#shop"
            className="mt-10 inline-block rounded-full bg-brand px-8 py-3 text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark"
          >
            Shop the drop
          </a>
        </div>
      </section>



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

      {/* Full-width photo banner */}
      <section className="relative mb-20 h-[60vh] min-h-[380px] overflow-hidden bg-ink">
        <img src="/images/lookbook/gym.webp" alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="relative flex h-full flex-col justify-end px-4 pb-12 text-white sm:px-10 sm:pb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/80">New drop</p>
          <h2 className="display mt-2 text-4xl leading-none sm:text-6xl">
            Built for <span className="text-brand">the grind.</span>
          </h2>
          <p className="mt-4 max-w-md text-white/85">Heavyweight oversized tees that keep up with every rep.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/shop-men" className="bg-white px-6 py-3 text-sm font-semibold uppercase tracking-wider text-ink transition hover:bg-brand hover:text-white">
              Shop men
            </Link>
            <Link to="/shop-women" className="bg-white px-6 py-3 text-sm font-semibold uppercase tracking-wider text-ink transition hover:bg-brand hover:text-white">
              Shop women
            </Link>
          </div>
        </div>
      </section>

      <Shop />

      <Lookbook />

      <Testimonials />

      <section className="relative overflow-hidden py-24 text-center">
        <ClawMark className="pointer-events-none absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 opacity-10" />
        <div className="relative mx-auto max-w-2xl px-4">
          <p className="text-sm font-bold uppercase tracking-widest text-ink/60">From zero to number one</p>
          <p className="display mt-4 text-3xl leading-tight sm:text-4xl">
            We are not just clothing. We are a <span className="text-brand">mindset</span> you wear.
          </p>
        </div>
      </section>
    </>
  )
}
