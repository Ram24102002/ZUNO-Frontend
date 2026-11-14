import { useEffect, useState } from 'react'
import { api } from '../api'
import { useAccount } from '../account'

const inputClass = 'mt-1 w-full rounded-lg border-2 border-neutral-200 px-4 py-2.5 outline-none focus:border-brand'
const labelClass = 'block text-sm font-semibold'

let statesCache = null
/** India's states for the address forms, loaded once. */
export function useStates() {
  const [states, setStates] = useState(statesCache ?? [])
  useEffect(() => {
    if (statesCache) return
    api('/config').then((c) => { statesCache = c.states ?? []; setStates(statesCache) }).catch(() => {})
  }, [])
  return states
}

/** The delivery address fields, shared by checkout and the address book. */
export function AddressFields({ value, onChange, idPrefix }) {
  const states = useStates()
  const field = (name) => ({
    id: `${idPrefix}-${name}`,
    value: value[name] ?? '',
    onChange: (e) => onChange({ ...value, [name]: e.target.value }),
  })

  return (
    <>
      <div>
        <label htmlFor={`${idPrefix}-name`} className={labelClass}>Name</label>
        <input {...field('name')} required maxLength={80} autoComplete="name" className={inputClass} />
      </div>
      <div>
        <label htmlFor={`${idPrefix}-phone`} className={labelClass}>Phone</label>
        <input {...field('phone')} required type="tel" pattern="\+?[\d\s\-]{8,20}" title="8 to 20 digits" autoComplete="tel" className={inputClass} />
      </div>
      <div>
        <label htmlFor={`${idPrefix}-address`} className={labelClass}>Address</label>
        <textarea {...field('address')} required rows={2} maxLength={400} autoComplete="street-address" className={inputClass} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor={`${idPrefix}-city`} className={labelClass}>City</label>
          <input {...field('city')} required maxLength={80} autoComplete="address-level2" className={inputClass} />
        </div>
        <div>
          <label htmlFor={`${idPrefix}-state`} className={labelClass}>State</label>
          <select {...field('state')} required autoComplete="address-level1" className={`${inputClass} bg-white`}>
            <option value="" disabled>Choose…</option>
            {states.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor={`${idPrefix}-postcode`} className={labelClass}>PIN code</label>
          <input {...field('postcode')} required inputMode="numeric" pattern="\d{6}" title="6-digit PIN code" autoComplete="postal-code" className={inputClass} />
        </div>
      </div>
    </>
  )
}

/** Add or edit one saved address. */
export default function AddressForm({ address, onDone }) {
  const { saveAddress } = useAccount()
  const [value, setValue] = useState({ name: '', phone: '', address: '', city: '', state: '', postcode: '', ...address })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await saveAddress(value)
      onDone()
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="max-w-xl space-y-4">
      <h2 className="display text-2xl">{address.id ? 'Edit address' : 'New address'}</h2>
      <AddressFields value={value} onChange={setValue} idPrefix="address" />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={Boolean(value.isDefault)}
          onChange={(e) => setValue((v) => ({ ...v, isDefault: e.target.checked }))}
          className="h-4 w-4 accent-brand"
        />
        Use as my default address
      </label>
      {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
      <div className="flex gap-4">
        <button disabled={busy} className="rounded-full bg-brand px-8 py-3 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-brand-dark disabled:bg-neutral-300">
          {busy ? 'Saving…' : 'Save address'}
        </button>
        <button type="button" onClick={onDone} className="text-sm font-semibold text-ink/60 hover:text-brand">Cancel</button>
      </div>
    </form>
  )
}
