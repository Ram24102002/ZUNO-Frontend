import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../cart'
import { useAccount } from '../account'
import { api } from '../api'
import { AddressFields } from '../components/AddressForm'

const inputClass = 'mt-1 w-full rounded-lg border-2 border-neutral-200 px-4 py-2.5 outline-none focus:border-brand'
const labelClass = 'block text-sm font-semibold'
const primaryButton =
  'w-full rounded-full bg-brand py-4 text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark disabled:bg-neutral-300 disabled:shadow-none'
const EMPTY_ADDRESS = { name: '', phone: '', address: '', city: '', state: '', postcode: '' }
const NEW_ADDRESS = 'new'

const loadRazorpay = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve()
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = resolve
    script.onerror = () => reject(new Error('Could not load the payment window. Check your connection.'))
    document.body.appendChild(script)
  })

/** Opens the Razorpay popup; resolves with Razorpay's signed payment details. */
const collectPayment = async (checkout, customer) => {
  await loadRazorpay()
  return new Promise((resolve, reject) => {
    new window.Razorpay({
      key: checkout.razorpay.keyId,
      order_id: checkout.razorpay.orderId,
      name: 'ZUNO',
      description: 'ZUNO order',
      prefill: { name: customer.name, email: customer.email, contact: customer.phone },
      theme: { color: '#1d9bf0' },
      handler: resolve,
      modal: { ondismiss: () => reject(new Error('Payment was not completed.')) },
    }).open()
  })
}

const linesForServer = (lines) => lines.map(({ productId, color, size, quantity, design }) => ({ productId, color, size, quantity, design }))

function CartLine({ line, locked }) {
  const { setQuantity, remove } = useCart()
  const stepClass = 'h-9 w-9 rounded-lg border-2 border-neutral-200 font-semibold hover:border-brand disabled:opacity-40'
  return (
    <li className="flex gap-4 py-5">
      <img src={line.image} alt="" className="h-24 w-20 shrink-0 rounded-lg bg-neutral-100 object-cover" />
      <div className="min-w-0 flex-1">
        <div className="flex justify-between gap-3">
          <p className="font-semibold">{line.name}</p>
          <p className="shrink-0 font-semibold">₹{line.unitPrice * line.quantity}</p>
        </div>
        <p className="text-sm text-ink/70">{line.color} · Size {line.size}</p>
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={() => setQuantity(line.key, line.quantity - 1)}
            disabled={locked || line.quantity <= 1}
            aria-label={`One less ${line.name}`}
            className={stepClass}
          >
            −
          </button>
          <span className="w-6 text-center font-semibold" aria-label="Quantity">{line.quantity}</span>
          <button
            onClick={() => setQuantity(line.key, line.quantity + 1)}
            disabled={locked}
            aria-label={`One more ${line.name}`}
            className={stepClass}
          >
            +
          </button>
          <button
            onClick={() => remove(line.key)}
            disabled={locked}
            className="ml-auto text-sm font-semibold text-ink/60 hover:text-red-500 disabled:opacity-40"
          >
            Remove
          </button>
        </div>
      </div>
    </li>
  )
}

/** Coupon box. Applying asks the server to price the cart with the code. */
function Coupon({ lines, coupon, onChange, onChecking, locked }) {
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const apply = async (e) => {
    e.preventDefault()
    setBusy(true)
    onChecking(true)
    setError(null)
    try {
      const quote = await api('/cart/quote', { method: 'POST', body: { items: linesForServer(lines), coupon: code.trim() } })
      if (quote.couponError) setError(quote.couponError)
      else {
        onChange(quote)
        setCode('')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
      onChecking(false)
    }
  }

  if (coupon) {
    return (
      <p className="mt-4 flex items-center justify-between rounded-lg bg-green-50 px-4 py-2.5 text-sm text-green-800">
        <span>Coupon <span className="font-bold">{coupon}</span> applied</span>
        {!locked && <button onClick={() => onChange(null)} className="font-semibold hover:underline">Remove</button>}
      </p>
    )
  }

  return (
    <form onSubmit={apply} className="mt-4">
      <label htmlFor="coupon" className="sr-only">Coupon code</label>
      <div className="flex gap-2">
        <input
          id="coupon"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Coupon code"
          maxLength={50}
          disabled={locked}
          className="w-full rounded-lg border-2 border-neutral-200 px-4 py-2 uppercase outline-none focus:border-brand"
        />
        <button disabled={busy || locked || !code.trim()} className="shrink-0 rounded-lg border-2 border-ink px-5 text-sm font-semibold uppercase transition hover:border-brand hover:text-brand disabled:opacity-40">
          {busy ? '…' : 'Apply'}
        </button>
      </div>
      {error && <p role="alert" className="mt-1 text-sm text-red-500">{error}</p>}
    </form>
  )
}

export default function Cart() {
  const { lines, total, clear } = useCart()
  const { customer } = useAccount()
  const [address, setAddress] = useState(EMPTY_ADDRESS)
  const [addressChoice, setAddressChoice] = useState(NEW_ADDRESS) // a saved address id, or NEW_ADDRESS
  const [saveAddress, setSaveAddress] = useState(true)
  const [email, setEmail] = useState('')
  const [note, setNote] = useState('')
  const [quote, setQuote] = useState(null) // { subtotal, discount, total, coupon } while a coupon is applied
  // While a coupon is being checked the order must wait, or it would be placed without the discount
  const [checkingCoupon, setCheckingCoupon] = useState(false)
  const [payOnline, setPayOnline] = useState(false)
  // Razorpay only: the checkout opened for this cart ({ checkout, total, razorpay }), and the signed
  // payment once Razorpay has taken it. Keeping the payment means a failed confirmation is retried,
  // never charged twice. While a checkout is open the cart and details are locked.
  const [pending, setPending] = useState(null)
  const [payment, setPayment] = useState(null)
  const [order, setOrder] = useState(null) // the placed order: { id, total, paid }
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    api('/config').then((c) => setPayOnline(Boolean(c.razorpayKeyId))).catch(() => {})
  }, [])

  // Logged in: start from the default saved address, or at least the account's name and phone
  useEffect(() => {
    if (!customer) {
      setAddressChoice(NEW_ADDRESS)
      return
    }
    const preferred = customer.addresses.find((a) => a.isDefault) ?? customer.addresses[0]
    if (preferred) {
      setAddressChoice(preferred.id)
      setAddress(preferred)
    } else {
      setAddress((a) => ({ ...a, name: a.name || customer.name, phone: a.phone || customer.phone || '' }))
    }
  }, [customer?.email]) // eslint-disable-line react-hooks/exhaustive-deps

  // A changed cart needs the coupon re-checked against the new lines
  const couponCode = quote?.coupon
  useEffect(() => {
    if (!couponCode || pending || lines.length === 0) return
    let current = true
    setCheckingCoupon(true)
    api('/cart/quote', { method: 'POST', body: { items: linesForServer(lines), coupon: couponCode } })
      .then((next) => {
        if (!current) return
        if (next.couponError) {
          setQuote(null)
          setError(`Coupon ${couponCode} was removed: ${next.couponError}`)
        } else setQuote(next)
      })
      .catch(() => {})
      .finally(() => current && setCheckingCoupon(false))
    return () => { current = false }
  }, [lines]) // eslint-disable-line react-hooks/exhaustive-deps

  const chooseAddress = (choice) => {
    setAddressChoice(choice)
    const saved = customer?.addresses.find((a) => a.id === choice)
    setAddress(saved ?? { ...EMPTY_ADDRESS, name: customer?.name ?? '', phone: customer?.phone ?? '' })
  }

  const finish = (placed) => {
    setOrder(placed)
    setPending(null)
    setPayment(null)
    setQuote(null)
    clear()
  }

  const confirmPayment = async (checkout, signed) => {
    finish(await api('/orders/pay', { method: 'POST', body: { checkout: checkout.checkout, ...signed } }))
  }

  const pay = async (checkout) => {
    const signed = await collectPayment(checkout, { ...address, email: customer?.email ?? email })
    setPayment(signed)
    await confirmPayment(checkout, signed)
  }

  const placeOrder = async (e) => {
    e.preventDefault()
    if (checkingCoupon) return
    setBusy(true)
    setError(null)
    try {
      if (payment) return await confirmPayment(pending, payment)
      if (pending) return await pay(pending)

      const saved = await api('/orders', {
        method: 'POST',
        body: {
          ...address,
          email: customer ? null : email,
          note,
          items: linesForServer(lines),
          coupon: quote?.coupon ?? null,
          saveAddress: Boolean(customer) && addressChoice === NEW_ADDRESS && saveAddress,
        },
      })
      if (!saved.razorpay) return finish(saved)
      setPending(saved)
      await pay(saved)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  // Lets the shopper change the cart or details after closing the payment window without paying
  const cancelPayment = () => {
    setPending(null)
    setError(null)
  }

  if (order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div role="status" className="rounded-2xl bg-brand-light px-6 py-10">
          <p className="display text-3xl">Order placed</p>
          <p className="mt-3 text-ink/70">
            Order <span className="font-bold text-ink">#{order.id}</span> · Total{' '}
            <span className="font-bold text-ink">₹{order.total}</span>
            {order.discount > 0 && <span className="text-green-700"> (you saved ₹{order.discount})</span>}
          </p>
          <p className="mt-3 text-ink/70">
            {order.paid
              ? 'Payment received. We will message you when it ships.'
              : `Pay on delivery. We will call you on ${address.phone} to confirm.`}
          </p>
        </div>
        <div className="mt-6 flex justify-center gap-6">
          {customer
            ? <Link to={`/account/orders/${order.id}`} className="font-semibold text-brand">View order</Link>
            : <Link to="/orders" className="font-semibold text-brand">Track order</Link>}
          <Link to="/" className="font-semibold text-brand">Back to shop</Link>
          <Link to="/contact" className="font-semibold text-brand">Contact us</Link>
        </div>
      </div>
    )
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="display text-4xl">Your <span className="text-brand">cart</span></h1>
        <p className="mt-4 text-ink/60">Your cart is empty.</p>
        <Link to="/" className="mt-6 inline-block font-semibold text-brand">Shop the collection</Link>
      </div>
    )
  }

  const locked = Boolean(pending)
  const subtotal = quote?.subtotal ?? total
  const discount = quote?.discount ?? 0
  const amount = pending?.total ?? quote?.total ?? total
  let buttonLabel = payOnline ? `Pay ₹${amount}` : `Place order · ₹${amount}`
  if (payment) buttonLabel = busy ? 'Confirming payment…' : 'Retry confirming payment'
  else if (busy) buttonLabel = pending ? 'Waiting for payment…' : 'Placing order…'

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-2">
      <section>
        <h1 className="display text-4xl">Your <span className="text-brand">cart</span></h1>
        <ul className="mt-4 divide-y divide-neutral-200">
          {lines.map((line) => <CartLine key={line.key} line={line} locked={locked} />)}
        </ul>
        <div className="space-y-1 border-t-2 border-ink pt-4">
          {discount > 0 && (
            <>
              <p className="flex justify-between text-sm"><span>Subtotal</span><span>₹{subtotal}</span></p>
              <p className="flex justify-between text-sm text-green-700"><span>Discount ({quote.coupon})</span><span>−₹{discount}</span></p>
            </>
          )}
          <p className="flex justify-between text-lg font-bold"><span>Total</span><span>₹{amount}</span></p>
        </div>
        <p className="mt-1 text-sm text-ink/60">Free delivery.</p>
        <p className="mt-1 text-sm text-ink/60">Questions about sizing or delivery? <Link to="/contact" className="font-semibold text-brand">Contact us</Link></p>
        <Coupon lines={lines} coupon={quote?.coupon} onChange={setQuote} onChecking={setCheckingCoupon} locked={locked} />
      </section>

      <form onSubmit={placeOrder} className="space-y-4 md:pt-2">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="display text-2xl">Delivery details</h2>
          {!customer && (
            <Link to="/account" state={{ from: '/cart' }} className="text-sm font-semibold text-brand">Log in for saved addresses</Link>
          )}
        </div>
        <fieldset disabled={locked} className="space-y-4">
          {customer?.addresses.length > 0 && (
            <div className="space-y-2">
              {customer.addresses.map((a) => (
                <label key={a.id} className={`flex cursor-pointer gap-3 rounded-xl border-2 p-3 text-sm ${addressChoice === a.id ? 'border-brand' : 'border-neutral-200'}`}>
                  <input type="radio" name="address" checked={addressChoice === a.id} onChange={() => chooseAddress(a.id)} className="mt-1 accent-brand" />
                  <span>
                    <span className="font-semibold">{a.name}</span> · {a.phone}
                    <span className="block text-ink/70">{a.address.replace(/\n/g, ', ')}, {a.city} {a.postcode}</span>
                  </span>
                </label>
              ))}
              <label className={`flex cursor-pointer gap-3 rounded-xl border-2 p-3 text-sm font-semibold ${addressChoice === NEW_ADDRESS ? 'border-brand' : 'border-neutral-200'}`}>
                <input type="radio" name="address" checked={addressChoice === NEW_ADDRESS} onChange={() => chooseAddress(NEW_ADDRESS)} className="accent-brand" />
                Deliver somewhere else
              </label>
            </div>
          )}

          {addressChoice === NEW_ADDRESS && (
            <>
              <AddressFields value={address} onChange={setAddress} idPrefix="order" />
              {customer && (
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} className="h-4 w-4 accent-brand" />
                  Save this address to my account
                </label>
              )}
            </>
          )}

          {customer ? (
            <p className="text-sm text-ink/60">Order updates go to {customer.email}.</p>
          ) : (
            <div>
              <label htmlFor="order-email" className={labelClass}>Email</label>
              <input id="order-email" value={email} onChange={(e) => setEmail(e.target.value)} required type="email" maxLength={120} autoComplete="email" className={inputClass} />
            </div>
          )}
          <div>
            <label htmlFor="order-note" className={labelClass}>Note (optional)</label>
            <input id="order-note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} className={inputClass} />
          </div>
        </fieldset>

        {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
        {payment && !busy && (
          <p className="text-sm text-ink/70">Razorpay has your payment. Confirming it will not charge you again.</p>
        )}

        <button disabled={busy || checkingCoupon} className={primaryButton}>{checkingCoupon ? 'Checking coupon…' : buttonLabel}</button>
        {pending && !payment && !busy && (
          <button type="button" onClick={cancelPayment} className="block w-full text-center text-sm font-semibold text-ink/60 hover:text-brand">
            Change cart or details
          </button>
        )}
        <p className="text-center text-xs text-ink/50">
          {payOnline ? 'Secure payment by Razorpay: UPI, cards and netbanking.' : 'Pay on delivery. We call you to confirm the order.'}
        </p>
      </form>
    </div>
  )
}
