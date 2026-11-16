import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, formatDate } from '../api'
import { useAccount } from '../account'
import { StatusBadge } from './Account'

/** One order from the customer's history, with cancel while it is still possible. */
export default function AccountOrder() {
  const { number } = useParams()
  const { customer, ready } = useAccount()
  const [order, setOrder] = useState(null)
  const [error, setError] = useState(null)
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!customer) return
    api(`/account/orders/${number}`).then(setOrder).catch((err) => setError(err.status === 404 ? 'Order not found.' : err.message))
  }, [number, customer])

  const cancel = async () => {
    setBusy(true)
    setError(null)
    try {
      setOrder(await api(`/account/orders/${number}/cancel`, { method: 'POST' }))
      setConfirming(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (ready && !customer) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <p className="text-ink/60">Log in to see your orders.</p>
        <Link to="/account" state={{ from: `/account/orders/${number}` }} className="mt-4 inline-block font-semibold text-brand">Log in</Link>
      </div>
    )
  }
  if (error && !order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <p className="text-ink/60">{error}</p>
        <Link to="/account" className="mt-4 inline-block font-semibold text-brand">Back to your account</Link>
      </div>
    )
  }
  if (!order) return <p className="py-24 text-center text-ink/50">Loading…</p>

  const row = 'flex justify-between py-1'

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link to="/account" className="text-sm font-medium text-ink/60 hover:text-brand">← Your orders</Link>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <h1 className="display text-4xl">Order <span className="text-brand">#{order.number}</span></h1>
        <StatusBadge order={order} />
      </div>
      <p className="mt-2 text-ink/60">
        Placed {formatDate(order.date)} · {order.payment} · <Link to="/contact" className="font-semibold text-brand">Help with this order</Link>
      </p>
      {order.tracking.length > 0 && (
        <p className="mt-2 text-sm">Tracking number: <span className="font-semibold">{order.tracking.join(', ')}</span></p>
      )}

      <div className="mt-10 grid gap-10 md:grid-cols-[1fr_18rem]">
        <ul className="divide-y divide-neutral-200">
          {order.items.map((item, i) => (
            <li key={i} className="flex gap-4 py-4">
              {item.image ? (
                <img src={item.image} alt="" className="h-24 w-20 shrink-0 rounded-lg bg-neutral-100 object-cover" />
              ) : (
                <div className="flex h-24 w-20 shrink-0 items-center justify-center rounded-lg bg-brand-light text-xs font-semibold text-brand">
                  {item.custom ? 'Your design' : ''}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex justify-between gap-3">
                  {item.productId ? (
                    <Link to={`/product/${item.productId}`} className="font-semibold hover:text-brand">{item.name}</Link>
                  ) : (
                    <p className="font-semibold">{item.name}</p>
                  )}
                  <p className="shrink-0 font-semibold">₹{item.total}</p>
                </div>
                <p className="text-sm text-ink/70">
                  {[item.color, item.size && `Size ${item.size}`].filter(Boolean).join(' · ')}
                </p>
                <p className="text-sm text-ink/70">Qty {item.quantity} × ₹{item.price}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="space-y-6">
          <div className="rounded-2xl bg-neutral-50 p-5 text-sm">
            <p className={row}><span>Subtotal</span><span>₹{order.subtotal}</span></p>
            {order.discount > 0 && (
              <p className={`${row} text-green-700`}>
                <span>Discount{order.coupon ? ` (${order.coupon})` : ''}</span><span>−₹{order.discount}</span>
              </p>
            )}
            <p className={row}><span>Delivery</span><span>{order.shipping > 0 ? `₹${order.shipping}` : 'Free'}</span></p>
            <p className={`${row} mt-2 border-t border-neutral-200 pt-3 text-base font-bold`}><span>Total</span><span>₹{order.total}</span></p>
          </div>
          {order.address && (
            <div className="text-sm">
              <p className="mb-1 font-semibold uppercase tracking-wider">Delivering to</p>
              <p>{order.address.name}</p>
              <p className="whitespace-pre-line text-ink/70">{order.address.address}</p>
              <p className="text-ink/70">{order.address.city}, {order.address.state} {order.address.postcode}</p>
              <p className="text-ink/70">{order.address.phone}</p>
            </div>
          )}
          {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
          {order.canCancel && !confirming && (
            <button onClick={() => setConfirming(true)} className="text-sm font-semibold text-ink/60 hover:text-red-500">Cancel this order</button>
          )}
          {confirming && (
            <div className="rounded-2xl border-2 border-red-200 p-4 text-sm">
              <p>Cancel order #{order.number}? This cannot be undone.</p>
              <div className="mt-3 flex gap-4">
                <button onClick={cancel} disabled={busy} className="rounded-full bg-red-500 px-5 py-2 font-semibold text-white disabled:opacity-50">
                  {busy ? 'Cancelling…' : 'Yes, cancel'}
                </button>
                <button onClick={() => setConfirming(false)} className="font-semibold text-ink/60">Keep it</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
