import { Link } from 'react-router-dom'
import { ClawMark } from '../components/Logo'

// Three claw strokes that rip across the "404", leaning like the logo's /// mark
// (drawn in by the .claw-slash animation in index.css)
const SLASHES = [
  'M14 104 C 34 76, 52 46, 70 10',
  'M48 106 C 68 76, 86 46, 104 8',
  'M82 102 C 102 72, 120 42, 138 6',
]

export default function NotFound() {
  return (
    <div className="relative overflow-hidden">
      {/* Faint claw marks in the background, slowly drifting */}
      <ClawMark className="claw-float pointer-events-none absolute -left-10 top-10 h-48 w-48 opacity-10" />
      <ClawMark className="claw-float-late pointer-events-none absolute -right-8 bottom-6 h-40 w-40 opacity-10" />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center px-4 py-20 text-center sm:py-28">
        <p className="text-sm font-bold uppercase tracking-widest text-ink/60">Error 404 · Page not found</p>

        <div className="relative mt-4">
          <h1 className="nf-shake display select-none text-[8rem] leading-none sm:text-[12rem]">
            404
          </h1>
          <svg
            viewBox="0 0 150 110"
            className="pointer-events-none absolute inset-0 m-auto h-full w-[85%]"
            fill="none"
            aria-hidden="true"
          >
            {SLASHES.map((d, i) => (
              // A white edge under each blue stroke makes it look cut into the number
              <g key={d} style={{ '--delay': `${0.25 + i * 0.12}s` }}>
                <path d={d} pathLength="1" className="claw-slash stroke-white" strokeWidth="13" strokeLinecap="round" />
                <path d={d} pathLength="1" className="claw-slash stroke-brand" strokeWidth="6" strokeLinecap="round" />
              </g>
            ))}
          </svg>
        </div>

        <h2 className="display mt-8 text-3xl sm:text-4xl">
          This page <span className="text-brand">skipped leg day.</span>
        </h2>
        <p className="mt-4 max-w-md leading-relaxed text-ink/70">
          The page you are looking for doesn’t exist or has moved. Zero results here, but you’re one step from number one.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            to="/"
            className="rounded-full bg-brand px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark"
          >
            Back to home
          </Link>
          <Link
            to="/#shop"
            className="rounded-full border-2 border-ink px-8 py-3 text-sm font-semibold uppercase tracking-wider transition hover:border-brand hover:text-brand"
          >
            Shop the collection
          </Link>
        </div>
      </div>
    </div>
  )
}
