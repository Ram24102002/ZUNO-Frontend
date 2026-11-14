// Calls to the Bagisto backend (/api/zuno/*). The session cookie keeps customers logged in;
// Laravel also sets an XSRF-TOKEN cookie that must come back as a header on every change.
const BASE = '/api/zuno'

const xsrfToken = () => {
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : null
}

export class ApiError extends Error {
  constructor(message, status, fields = {}) {
    super(message)
    this.status = status
    this.fields = fields // { field: 'message' } from Laravel validation
  }
}

export async function api(path, { method = 'GET', body } = {}) {
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (method !== 'GET') {
    // The first visit may not have the cookie yet: any GET sets it
    if (!xsrfToken()) await fetch(`${BASE}/health`, { credentials: 'same-origin' })
    headers['X-XSRF-TOKEN'] = xsrfToken() ?? ''
  }

  const res = await fetch(BASE + path, {
    method,
    headers,
    credentials: 'same-origin',
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (res.status === 413) throw new ApiError('Your custom designs are too large to send together. Order them separately.', 413)
  if (res.status === 429) throw new ApiError('Too many attempts. Please wait a minute and try again.', 429)
  if (res.status === 419) throw new ApiError('Your session expired. Refresh the page and try again.', 419)

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const fields = Object.fromEntries(Object.entries(data.errors ?? {}).map(([k, v]) => [k, v[0]]))
    const message = data.error || Object.values(fields)[0] || (res.status === 401 ? 'Please log in.' : null)
    throw new ApiError(message || 'Something went wrong. Please try again.', res.status, fields)
  }
  return data
}

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
