import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api, formatDate } from '../api'
import { useAccount } from '../account'
import { Orders as OrderList, StatusBadge, inputClass, labelClass } from './Account'

// Progress steps shown for a tracked order
const STEPS = [
  { key: 'placed', label: 'Placed' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
]
const stepIndex = (status) => ({ pending: 0, pending_payment: 0, processing: 1, completed: 2 })[status] ?? -1

/** Orders: the logged-in customer's history, plus order tracking for anyone (guest checkout). */
export default function Orders() {
  const { customer, ready } = useAccount()

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="display text-4xl">Your <span className="text-brand">orders</span></h1>

      {ready && customer && (
        <section className="mt-8">
          <OrderList />
        </section>
      )}

      {ready && !customer && (
        <p className="mt-3 text-ink/70">
          Have an account? <Link to="/account" state={{ from: '/orders' }} className="font-semibold text-brand">Log in</Link> to see all your orders.
        </p>
      )}

      <TrackOrder signedIn={Boolean(customer)} />

      <p className="mt-12 border-t border-neutral-200 pt-6 text-sm text-ink/60">
        Something wrong with an order? <Link to="/contact" className="font-semibold text-brand">Contact us</Link>
      </p>
    </div>
  )
}

function TrackOrder({ signedIn }) {
  const [number, setNumber] = useState('')
  const [contact, setContact] = useState('')
  const [order, setOrder] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setOrder(null)
    try {
      setOrder(await api('/orders/track', { method: 'POST', body: { number, contact } }))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className={signedIn ? 'mt-14' : 'mt-8'}>
      <h2 className="display text-2xl">Track an <span className="text-brand">order</span></h2>
      <p className="mt-1 text-sm text-ink/60">Checked out as a guest? Enter your order number and the email or phone you used.</p>

      <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-[1fr_1.4fr_auto] sm:items-end">
        <label className={labelClass}>
          Order number
          <input value={number} onChange={(e) => setNumber(e.target.value)} required maxLength={30} placeholder="e.g. 1042" className={inputClass} />
        </label>
        <label className={labelClass}>
          Email or phone
          <input value={contact} onChange={(e) => setContact(e.target.value)} required maxLength={120} placeholder="you@example.com or 98765 43210" className={inputClass} />
        </label>
        <button
          disabled={busy}
          className="rounded-full bg-brand px-8 py-3 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-brand-dark disabled:opacity-50"
        >
          {busy ? 'Finding…' : 'Track'}
        </button>
      </form>

      {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
      {order && <TrackedOrder order={order} />}
    </section>
  )
}

function TrackedOrder({ order }) {
  const current = stepIndex(order.status)

  return (
    <div className="mt-8 rounded-2xl border border-neutral-200 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-lg font-bold">Order #{order.number}</p>
          <p className="text-sm text-ink/60">Placed {formatDate(order.date)} · {order.payment}</p>
        </div>
        <StatusBadge order={order} />
      </div>

      {current >= 0 && (
        <ol className="mt-6 flex items-center">
          {STEPS.map((step, i) => (
            <li key={step.key} className="flex flex-1 items-center last:flex-none">
              <span className="flex flex-col items-center gap-1">
                <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${i <= current ? 'bg-brand text-white' : 'bg-neutral-200 text-ink/50'}`}>
                  {i < current ? '✓' : i + 1}
                </span>
                <span className={`text-xs font-semibold ${i <= current ? 'text-ink' : 'text-ink/50'}`}>{step.label}</span>
              </span>
              {i < STEPS.length - 1 && <span className={`mx-2 mb-5 h-0.5 flex-1 ${i < current ? 'bg-brand' : 'bg-neutral-200'}`} />}
            </li>
          ))}
        </ol>
      )}

      {order.tracking.length > 0 && (
        <p className="mt-4 text-sm">Tracking number: <span className="font-semibold">{order.tracking.join(', ')}</span></p>
      )}

      <ul className="mt-6 divide-y divide-neutral-200">
        {order.items.map((item, i) => (
          <li key={i} className="flex gap-4 py-3">
            {item.image ? (
              <img src={item.image} alt="" className="h-20 w-16 shrink-0 rounded-lg bg-neutral-100 object-cover" />
            ) : (
              <div className="flex h-20 w-16 shrink-0 items-center justify-center rounded-lg bg-brand-light text-[10px] font-semibold text-brand">
                {item.custom ? 'Your design' : ''}
              </div>
            )}
            <div className="min-w-0 flex-1 text-sm">
              <div className="flex justify-between gap-3">
                <p className="font-semibold">{item.name}</p>
                <p className="shrink-0 font-semibold">₹{item.total}</p>
              </div>
              <p className="text-ink/70">{[item.color, item.size && `Size ${item.size}`].filter(Boolean).join(' · ')}</p>
              <p className="text-ink/70">Qty {item.quantity}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex justify-between border-t border-neutral-200 pt-4 font-bold">
        <span>Total</span><span>₹{order.total}</span>
      </div>
      {order.address && (
        <p className="mt-2 text-sm text-ink/60">Delivering to {order.address.name}, {order.address.city}{order.address.state ? `, ${order.address.state}` : ''}</p>
      )}
    </div>
  )
}
