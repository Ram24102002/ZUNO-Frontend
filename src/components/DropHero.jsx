import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

// Edit these for each drop. NEXT_DROP_AT is when the countdown hits zero (India time).
const HERO_IMAGE = '/images/lookbook/street.webp'
const CURRENT_DROP = { name: 'Oversize Drop Shoulder', text: 'Limited pieces. Dropping now.', to: '/shop-men' }
const NEXT_DROP = { name: 'Acid Wash Topwears', at: '2026-12-01T19:00:00+05:30' }

const pad = (n) => String(n).padStart(2, '0')

/** Days / hours / minutes left until `at`, refreshed every 15 seconds. */
function useCountdown(at) {
  const target = new Date(at).getTime()
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 15000)
    return () => clearInterval(id)
  }, [])

  const left = Math.max(0, target - now)
  return {
    done: left === 0,
    days: Math.floor(left / 86400000),
    hours: Math.floor(left / 3600000) % 24,
    minutes: Math.floor(left / 60000) % 60,
  }
}

function Unit({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-4xl font-black tabular-nums sm:text-5xl">{pad(value)}</span>
      <span className="mt-1 text-[10px] font-medium uppercase tracking-wider text-white/60 sm:text-xs">{label}</span>
    </div>
  )
}

const Colon = () => <span className="pb-5 text-3xl font-black sm:text-4xl">:</span>

/** Photo hero ("Wear your mindset") followed by the current drop and a countdown to the next. */
export default function DropHero() {
  const { done, days, hours, minutes } = useCountdown(NEXT_DROP.at)

  return (
    <>
      {/* Photo hero */}
      <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-ink text-center md:min-h-[85vh]">
        <img src={HERO_IMAGE} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative px-4">
          <h1 className="text-5xl leading-[0.95] font-black uppercase text-brand sm:text-7xl md:text-8xl">
            Wear your<br />mindset
          </h1>
          <p className="mt-6 text-sm font-light text-white/90 sm:text-base">Limited stock. No restocks.</p>
          <Link
            to={CURRENT_DROP.to}
            className="mt-8 inline-block rounded-full bg-white px-12 py-4 text-sm font-bold uppercase text-ink transition hover:bg-brand hover:text-white"
          >
            Shop drop
          </Link>
        </div>
      </section>

      {/* Current drop + countdown to the next */}
      <section className="bg-black text-white">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-2 md:py-24">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-brand">Current drop</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-5xl">{CURRENT_DROP.name}</h2>
            <p className="mt-4 text-sm font-light text-white/70">{CURRENT_DROP.text}</p>
            <Link
              to={CURRENT_DROP.to}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-xs font-bold uppercase text-white transition hover:opacity-90"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                <path d="M12 2c1 3.5 5 6 5 11a5 5 0 0 1-10 0c0-2.2 1-3.8 2-5 0 2 1 3 2 3 0-3-1-6 1-9z" />
              </svg>
              Selling fast
            </Link>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-brand">Next drop</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-5xl">{NEXT_DROP.name}</h2>
            {done ? (
              <p className="mt-6 text-2xl font-bold text-brand">Out now</p>
            ) : (
              <div className="mt-5 flex items-end gap-4 sm:gap-6" role="timer" aria-label={`${days} days, ${hours} hours, ${minutes} minutes left`}>
                <Unit value={days} label="Days" />
                <Colon />
                <Unit value={hours} label="Hours" />
                <Colon />
                <Unit value={minutes} label="Min" />
              </div>
            )}
            <Link
              to="/contact"
              className="mt-6 inline-block border border-brand px-8 py-3 text-xs font-bold uppercase text-brand transition hover:bg-brand hover:text-white"
            >
              Notify me
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
