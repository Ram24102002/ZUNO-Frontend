import { Link } from 'react-router-dom'
import { ClawMark } from '../components/Logo'

// Page-only motion. Claw strokes reuse .claw-slash / .claw-float from index.css.
const CSS = `
@keyframes cs-rise { from { opacity: 0; transform: translateY(40%) skewY(6deg); } to { opacity: 1; transform: none; } }
@keyframes cs-pop { 0% { opacity: 0; transform: scale(.6) rotate(-4deg); } 70% { transform: scale(1.06) rotate(1deg); } 100% { opacity: 1; transform: none; } }
@keyframes cs-fade { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
@keyframes cs-marquee { to { transform: translateX(-50%); } }
@keyframes cs-tee { 0%, 100% { transform: translateY(0) rotate(var(--r)); } 50% { transform: translateY(-16px) rotate(calc(var(--r) * -1)); } }
@keyframes cs-ping { 0% { transform: scale(1); opacity: .7; } 100% { transform: scale(2.4); opacity: 0; } }
.cs-rise { animation: cs-rise .8s cubic-bezier(.2,.8,.2,1) both; }
.cs-pop  { animation: cs-pop .7s cubic-bezier(.2,.8,.2,1) .45s both; }
.cs-fade { animation: cs-fade .7s ease-out both; }
.cs-marquee { animation: cs-marquee 22s linear infinite; }
.cs-tee  { animation: cs-tee 6s ease-in-out infinite; }
.cs-ping { animation: cs-ping 1.6s ease-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .cs-rise, .cs-pop, .cs-fade, .cs-marquee, .cs-tee, .cs-ping { animation: none; }
}
`

const SLASHES = [
  'M14 104 C 34 76, 52 46, 70 10',
  'M48 106 C 68 76, 86 46, 104 8',
  'M82 102 C 102 72, 120 42, 138 6',
]

const STEPS = [
  ['01', 'Pick your tee', 'Oversized, heavyweight, your colour.'],
  ['02', 'Drop your art', 'Upload a design or build one from scratch.'],
  ['03', 'Wear it loud', 'Printed and shipped, made just for you.'],
]

const MARQUEE = Array(6).fill('Design your own tee ✦ Coming soon ✦ ')

/** Placeholder for /design while the design studio is switched off. */
export default function ComingSoon() {
  return (
    <div className="relative overflow-hidden">
      <style>{CSS}</style>

      {/* Faint drifting claw marks */}
      <ClawMark className="claw-float pointer-events-none absolute -left-10 top-16 h-48 w-48 opacity-10" />
      <ClawMark className="claw-float-late pointer-events-none absolute -right-8 bottom-40 h-40 w-40 opacity-10" />

      {/* Floating tees (desktop) */}
      <img src="/images/products/flame-tee-1.webp" alt="" className="cs-tee pointer-events-none absolute top-24 left-[6%] hidden w-44 rounded-3xl shadow-2xl xl:block" style={{ '--r': '-8deg' }} />
      <img src="/images/products/jersey-80-1.webp" alt="" className="cs-tee pointer-events-none absolute top-40 right-[6%] hidden w-44 rounded-3xl shadow-2xl xl:block" style={{ '--r': '7deg', animationDelay: '-3s' }} />

      <section className="relative mx-auto flex max-w-4xl flex-col items-center px-4 pt-20 pb-16 text-center sm:pt-28">
        <span className="cs-fade inline-flex items-center gap-2 rounded-full bg-brand-light px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-brand">
          <span className="relative flex h-2 w-2">
            <span className="cs-ping absolute inset-0 rounded-full bg-brand" />
            <span className="relative h-2 w-2 rounded-full bg-brand" />
          </span>
          Design studio
        </span>

        <h1 className="display mt-6 leading-[0.85]" aria-label="Coming soon">
          <span className="block overflow-hidden pb-2">
            <span className="cs-rise block text-6xl sm:text-8xl lg:text-9xl" style={{ animationDelay: '.1s' }}>Coming</span>
          </span>
          <span className="relative mt-1 inline-block">
            <span className="cs-pop block text-7xl text-brand sm:text-9xl lg:text-[11rem]">Soon</span>
            {/* Claw strokes rip across "Soon" */}
            <svg viewBox="0 0 150 110" className="pointer-events-none absolute inset-0 m-auto h-full w-[70%]" fill="none" aria-hidden="true">
              {SLASHES.map((d, i) => (
                <g key={d} style={{ '--delay': `${1 + i * 0.12}s` }}>
                  <path d={d} pathLength="1" className="claw-slash stroke-white" strokeWidth="12" strokeLinecap="round" />
                  <path d={d} pathLength="1" className="claw-slash stroke-ink" strokeWidth="5" strokeLinecap="round" />
                </g>
              ))}
            </svg>
          </span>
        </h1>

        <p className="cs-fade mt-8 max-w-lg text-lg leading-relaxed text-ink/70" style={{ animationDelay: '1.2s' }}>
          We're building a studio where you design your own ZUNO tee. Final reps are in progress.
        </p>

        <div className="cs-fade mt-10 flex flex-wrap justify-center gap-4" style={{ animationDelay: '1.4s' }}>
          <Link
            to="/"
            className="rounded-full bg-brand px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-brand/30 transition hover:-translate-y-0.5 hover:bg-brand-dark"
          >
            Shop the collection
          </Link>
          <Link
            to="/search"
            className="rounded-full border-2 border-ink px-8 py-3 text-sm font-semibold uppercase tracking-wider transition hover:border-brand hover:text-brand"
          >
            Browse all tees
          </Link>
        </div>
      </section>

      {/* What's coming */}
      <section className="relative mx-auto grid max-w-5xl gap-4 px-4 pb-20 sm:grid-cols-3">
        {STEPS.map(([n, title, text], i) => (
          <div
            key={n}
            className="cs-fade rounded-3xl border border-neutral-200 bg-white/80 p-6 text-left backdrop-blur transition hover:-translate-y-1 hover:border-brand hover:shadow-xl hover:shadow-brand/10"
            style={{ animationDelay: `${1.6 + i * 0.15}s` }}
          >
            <p className="display text-3xl text-brand">{n}</p>
            <p className="mt-3 font-bold">{title}</p>
            <p className="mt-1 text-sm text-ink/60">{text}</p>
          </div>
        ))}
      </section>

      {/* Scrolling band */}
      <div className="relative -rotate-1 overflow-hidden bg-ink py-4 text-white">
        <div className="cs-marquee flex w-max whitespace-nowrap">
          {[0, 1].map((k) => (
            <span key={k} className="display pr-2 text-2xl sm:text-3xl" aria-hidden={k === 1}>
              {MARQUEE.join('')}
            </span>
          ))}
        </div>
      </div>
      <div className="h-16" />
    </div>
  )
}
