import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../api'
import { useAccount } from '../account'
import { inputClass, labelClass, primaryButton } from './Account'

/** Opened from the password reset email: /account/reset-password?token=…&email=… */
export default function ResetPassword() {
  const [params] = useSearchParams()
  const { login } = useAccount()
  const [password, setPassword] = useState('')
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const token = params.get('token')
  const email = params.get('email')

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await api('/account/reset-password', { method: 'POST', body: { token, email, password } })
      await login(email, password).catch(() => {}) // logging straight in is a convenience; the reset already worked
      setDone(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="display text-4xl">New <span className="text-brand">password</span></h1>
      {!token || !email ? (
        <p className="mt-6 text-ink/70">
          This link is incomplete. <Link to="/account" className="font-semibold text-brand">Ask for a new one</Link>.
        </p>
      ) : done ? (
        <div role="status" className="mt-6 rounded-2xl bg-brand-light p-5">
          Password changed and you are logged in. <Link to="/account" className="font-semibold text-brand">Go to your account</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-8 space-y-4">
          <p className="text-sm text-ink/70">For {email}</p>
          <div>
            <label htmlFor="reset-password" className={labelClass}>New password</label>
            <input id="reset-password" value={password} onChange={(e) => setPassword(e.target.value)} required type="password" minLength={8} autoComplete="new-password" className={inputClass} />
            <p className="mt-1 text-xs text-ink/50">At least 8 characters.</p>
          </div>
          {error && (
            <p role="alert" className="text-sm text-red-500">
              {error} <Link to="/account" className="font-semibold text-brand">Request a new link</Link>
            </p>
          )}
          <button disabled={busy} className={primaryButton}>{busy ? 'Saving…' : 'Save password'}</button>
        </form>
      )}
    </div>
  )
}
