import { Link } from 'react-router-dom'
import { INSTAGRAM_URL } from '../config'

// Shared "Explore" tiles. `href` = external link, `to` = page in the shop.
const EXPLORE = [
  { label: 'Oversized Fit Guide', img: '/images/products/jersey-80-2.webp', to: '/product/jersey-80' },
  { label: 'Design Your Own Tee', img: '/images/products/flame-tee-1.webp', to: '/design' },
  { label: 'Our Story', img: '/images/about/hoodie.webp', to: '/about' },
  { label: 'Follow @zuno.clo', img: '/images/products/polo-green-1.webp', href: INSTAGRAM_URL },
]

// Per-page content. Swap images/links when gender-specific photos and categories exist.
const PAGES = {
  women: {
    label: 'Women',
    hero: { img: '/images/lookbook/gym.webp', text: 'Oversized fits made for training hard and living loud.' },
    activities: [
      { label: 'Lifting', img: '/images/lookbook/gym.webp', to: '/' },
      { label: 'Running', img: '/images/lookbook/city.webp', to: '/' },
      { label: 'Street', img: '/images/lookbook/street.webp', to: '/' },
      { label: 'Rest Day', img: '/images/lookbook/beach.webp', to: '/' },
    ],
    about: [
      {
        title: "Women's Gym & Workout Clothes",
        text: "Workout clothes for women who train with purpose. ZUNO pieces are made to move, sweat and push limits with you — comfortable enough to live in, strong enough to train in. We make the clothes we want to wear, because the mindset matters as much as the work.",
      },
      {
        title: 'Built in the weight room',
        text: "ZUNO started with a love for training, and that's in every piece we make. Heavyweight cotton, drop-shoulder oversized fits and bold prints that hold up rep after rep. Whether you're lifting, running or recovering, you'll feel comfortable, supported and confident.",
      },
      {
        title: "Shop Women's Activewear",
        text: "From zero to number one — no matter the sport. Our women's range is designed to give you the freedom to perform at your best, on the gym floor, on the street or on your rest day.",
      },
    ],
  },
  men: {
    label: 'Men',
    hero: { img: '/images/lookbook/street.webp', text: 'Heavyweight oversized tees built for the grind — in the gym and out.' },
    activities: [
      { label: 'Lifting', img: '/images/lookbook/gym.webp', to: '/' },
      { label: 'Street', img: '/images/lookbook/city.webp', to: '/' },
      { label: 'City', img: '/images/lookbook/street.webp', to: '/' },
      { label: 'Rest Day', img: '/images/lookbook/beach.webp', to: '/' },
    ],
    about: [
      {
        title: "Men's Gym & Workout Clothes",
        text: "Workout clothes for men who refuse to stay average. ZUNO pieces are made for heavy sessions and long days — roomy where you need it, tough enough to take every rep. We make the clothes we want to train in, because the mindset is the uniform.",
      },
      {
        title: 'Built in the weight room',
        text: "ZUNO was born from the iron. Heavyweight cotton, drop-shoulder oversized cuts and bold prints that don't fade after a few washes. From the squat rack to the street, you'll feel strong, comfortable and ready.",
      },
      {
        title: "Shop Men's Activewear",
        text: "From zero to number one. Our men's range gives you the freedom to move, lift and live loud — on the gym floor, in the city or on your rest day.",
      },
    ],
  },
}

function Tile({ label, img, to, href, tall }) {
  const inner = (
    <>
      <div className={`overflow-hidden bg-neutral-100 ${tall ? 'aspect-[3/4]' : 'aspect-[4/3]'}`}>
        <img src={img} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      </div>
      <p className="mt-3 text-sm font-semibold uppercase tracking-wider">{label}</p>
    </>
  )
  return href
    ? <a href={href} target="_blank" rel="noreferrer" className="group block">{inner}</a>
    : <Link to={to} className="group block">{inner}</Link>
}

export default function ShopGender({ gender }) {
  const page = PAGES[gender]

  return (
    <>
      {/* Hero banner */}
      <section className="under-nav relative h-[70vh] min-h-[420px] overflow-hidden bg-ink">
        <img src={page.hero.img} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="relative flex h-full flex-col justify-end px-4 pb-12 text-white sm:px-10 sm:pb-16">
          <p className="text-sm font-bold uppercase tracking-widest text-white/80">{page.label}</p>
          <h1 className="display mt-2 text-5xl leading-none sm:text-7xl">
            Wear the <span className="text-brand">Mindset.</span>
          </h1>
          <p className="mt-4 max-w-md text-white/85">{page.hero.text}</p>
          <Link to="/" className="mt-6 inline-block w-fit bg-white px-6 py-3 text-sm font-semibold uppercase tracking-wider text-ink transition hover:bg-brand hover:text-white">
            Shop now
          </Link>
        </div>
      </section>

      {/* How do you train? */}
      <section className="px-4 py-16 sm:px-10">
        <h2 className="display text-2xl sm:text-3xl">How do you train?</h2>
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {page.activities.map((a) => <Tile key={a.label} {...a} tall />)}
        </div>
      </section>

      {/* Explore */}
      <section className="px-4 pb-16 sm:px-10">
        <h2 className="display text-2xl sm:text-3xl">Explore</h2>
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {EXPLORE.map((e) => <Tile key={e.label} {...e} />)}
        </div>
      </section>

      {/* About the range */}
      <section className="border-t border-neutral-200 px-4 py-12 sm:px-10">
        <div className="space-y-8">
          {page.about.map(({ title, text }) => (
            <div key={title}>
              <h2 className="display text-xl">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink/70">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
