import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { api, formatDate } from '../api'
import { useAccount } from '../account'
import AddressForm from '../components/AddressForm'

export const inputClass = 'mt-1 w-full rounded-lg border-2 border-neutral-200 px-4 py-2.5 outline-none focus:border-brand'
export const labelClass = 'block text-sm font-semibold'
export const primaryButton =
  'w-full rounded-full bg-brand py-3.5 text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark disabled:bg-neutral-300 disabled:shadow-none'
const tabClass = (active) =>
  `border-b-2 px-1 pb-3 text-sm font-semibold uppercase tracking-wider transition ${
    active ? 'border-brand text-brand' : 'border-transparent text-ink/60 hover:text-brand'
  }`

/** A form's busy/error state around one async action. */
function useSubmit(action) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const submit = async (e) => {
    e?.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await action()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }
  return { busy, error, submit }
}

/** The only way in: a full-page trip to Google and back (the backend sends the shopper on to `from` afterwards). */
function GoogleButton({ from }) {
  const [loginUrl, setLoginUrl] = useState(null) // null while checking

  useEffect(() => {
    api('/config')
      .then((config) => setLoginUrl(config.googleLogin ? config.googleLoginUrl || '/api/zuno/account/google' : ''))
      .catch(() => setLoginUrl(''))
  }, [])

  if (loginUrl === null) return null
  if (!loginUrl) return <p className="text-sm text-ink/60">Signing in is not available right now. Please try again later.</p>

  return (
    <a
      href={`${loginUrl}?from=${encodeURIComponent(from)}`}
      className="flex w-full items-center justify-center gap-3 rounded-full border-2 border-neutral-200 py-3 text-sm font-semibold transition hover:border-ink"
    >
      <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
        <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
        <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
      </svg>
      Continue with Google
    </a>
  )
}

function SignedOut() {
  const location = useLocation()
  // Google sign-in comes back here with ?error=… when it could not finish
  const googleError = new URLSearchParams(location.search).get('error')

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="display text-4xl">
        Welcome to <span className="text-brand">ZUNO</span>
      </h1>
      <p className="mt-3 mb-8 text-ink/70">Sign in with your Google account. New here? The same button creates your account.</p>
      {googleError && <p role="alert" className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{googleError}</p>}
      <GoogleButton from={location.state?.from ?? '/account'} />
      <p className="mt-8 text-center text-sm text-ink/60">
        You can also check out as a guest. An account keeps your addresses and order history.
      </p>
      <p className="mt-3 text-center text-sm text-ink/60">
        Trouble signing in? <Link to="/contact" className="font-semibold text-brand">Contact us</Link>
      </p>
    </div>
  )
}

const statusClass = (status) =>
  ({
    canceled: 'bg-neutral-100 text-ink/60',
    completed: 'bg-green-50 text-green-700',
    processing: 'bg-brand-light text-brand-dark',
  })[status] ?? 'bg-amber-50 text-amber-800'

export function StatusBadge({ order }) {
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(order.status)}`}>{order.statusLabel}</span>
}

export function Orders() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    api(`/account/orders?page=${page}`)
      .then((next) => setData((prev) => (page > 1 && prev ? { ...next, orders: [...prev.orders, ...next.orders] } : next)))
      .catch((err) => setError(err.message))
  }, [page])

  if (error) return <p className="text-red-500">{error}</p>
  if (!data) return <p className="text-ink/50">Loading…</p>
  if (data.orders.length === 0) {
    return (
      <div className="rounded-2xl bg-neutral-50 py-12 text-center">
        <p className="text-ink/60">No orders yet.</p>
        <Link to="/#shop" className="mt-3 inline-block font-semibold text-brand">Shop the collection</Link>
      </div>
    )
  }

  return (
    <div>
      <ul className="divide-y divide-neutral-200">
        {data.orders.map((order) => (
          <li key={order.number}>
            <Link to={`/account/orders/${order.number}`} className="flex items-center justify-between gap-4 py-4 hover:text-brand">
              <div>
                <p className="font-semibold">Order #{order.number}</p>
                <p className="text-sm text-ink/60">
                  {formatDate(order.date)} · {order.itemCount} item{order.itemCount === 1 ? '' : 's'}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <StatusBadge order={order} />
                <span className="font-bold">₹{order.total}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {data.page < data.lastPage && (
        <button onClick={() => setPage((p) => p + 1)} className="mt-4 font-semibold text-brand">Show older orders</button>
      )}
    </div>
  )
}

function Addresses() {
  const { customer, deleteAddress } = useAccount()
  const [editing, setEditing] = useState(null) // an address, or {} for a new one
  const [error, setError] = useState(null)

  const remove = async (id) => {
    setError(null)
    try {
      await deleteAddress(id)
    } catch (err) {
      setError(err.message)
    }
  }

  if (editing) return <AddressForm address={editing} onDone={() => setEditing(null)} />

  return (
    <div className="space-y-4">
      {customer.addresses.length === 0 && <p className="text-ink/60">No saved addresses yet. They are saved when you check out.</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        {customer.addresses.map((a) => (
          <div key={a.id} className={`rounded-2xl border-2 p-5 ${a.isDefault ? 'border-brand' : 'border-neutral-200'}`}>
            {a.isDefault && <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand">Default</p>}
            <p className="font-semibold">{a.name}</p>
            <p className="whitespace-pre-line text-sm text-ink/70">{a.address}</p>
            <p className="text-sm text-ink/70">{a.city}, {a.state} {a.postcode}</p>
            <p className="text-sm text-ink/70">{a.phone}</p>
            <div className="mt-4 flex gap-4 text-sm font-semibold">
              <button onClick={() => setEditing(a)} className="text-brand">Edit</button>
              <button onClick={() => remove(a.id)} className="text-ink/60 hover:text-red-500">Delete</button>
            </div>
          </div>
        ))}
      </div>
      {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
      <button onClick={() => setEditing({})} className="rounded-full border-2 border-ink px-6 py-2.5 text-sm font-semibold uppercase tracking-wider transition hover:border-brand hover:text-brand">
        + Add address
      </button>
    </div>
  )
}

function Profile() {
  const { customer, update } = useAccount()
  const [form, setForm] = useState({
    firstName: customer.firstName, lastName: customer.lastName ?? '', phone: customer.phone ?? '',
  })
  const [saved, setSaved] = useState(false)
  const { busy, error, submit } = useSubmit(async () => {
    setSaved(false)
    await update({ ...form, phone: form.phone || null })
    setSaved(true)
  })
  const field = (name) => ({ id: `profile-${name}`, value: form[name], onChange: (e) => setForm((f) => ({ ...f, [name]: e.target.value })) })

  return (
    <form onSubmit={submit} className="max-w-md space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="profile-firstName" className={labelClass}>First name</label>
          <input {...field('firstName')} required maxLength={60} className={inputClass} />
        </div>
        <div>
          <label htmlFor="profile-lastName" className={labelClass}>Last name</label>
          <input {...field('lastName')} maxLength={60} className={inputClass} />
        </div>
      </div>
      <div>
        <p className={labelClass}>Email</p>
        <p className="mt-1 text-ink/70">{customer.email}</p>
      </div>
      <div>
        <label htmlFor="profile-phone" className={labelClass}>Phone</label>
        <input {...field('phone')} type="tel" pattern="\+?[\d\s\-]{8,20}" title="8 to 20 digits" className={inputClass} />
      </div>
      {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
      {saved && <p role="status" className="text-sm text-green-700">Saved.</p>}
      <button disabled={busy} className={primaryButton}>{busy ? 'Saving…' : 'Save changes'}</button>
    </form>
  )
}

const TABS = [['orders', 'Orders'], ['addresses', 'Addresses'], ['profile', 'Profile']]

export default function Account() {
  const { customer, ready, logout } = useAccount()
  const location = useLocation()
  const navigate = useNavigate()
  const [tab, setTab] = useState(location.state?.tab ?? 'orders')
  const [wasSignedOut, setWasSignedOut] = useState(false)

  // After logging in from a page that sent the shopper here (e.g. "log in to review"), go back there
  useEffect(() => {
    if (!ready) return
    if (!customer) setWasSignedOut(true)
    else if (wasSignedOut && location.state?.from) navigate(location.state.from, { replace: true })
  }, [ready, customer]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!ready) return <p className="py-24 text-center text-ink/50">Loading…</p>
  if (!customer) return <SignedOut />

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="display text-4xl">
          Hi, <span className="text-brand">{customer.firstName}</span>
        </h1>
        <button onClick={() => logout()} className="text-sm font-semibold text-ink/60 hover:text-brand">Log out</button>
      </div>
      <div className="mt-8 mb-8 flex gap-6 border-b border-neutral-200">
        {TABS.map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} className={tabClass(tab === key)}>{label}</button>
        ))}
      </div>
      {tab === 'orders' && <Orders />}
      {tab === 'addresses' && <Addresses />}
      {tab === 'profile' && <Profile />}
      <p className="mt-12 border-t border-neutral-200 pt-6 text-sm text-ink/60">
        Need help with an order? <Link to="/contact" className="font-semibold text-brand">Contact us</Link>
      </p>
    </div>
  )
}
