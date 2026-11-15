import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api } from './api'

// The logged-in customer ({ firstName, lastName, name, email, phone, addresses }) or null.
// `ready` is false until the first check with the server has finished.
const AccountContext = createContext(null)

export function AccountProvider({ children }) {
  const [customer, setCustomer] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    api('/account')
      .then((data) => setCustomer(data.customer))
      .catch(() => {})
      .finally(() => setReady(true))
  }, [])

  // Every account endpoint answers with the fresh customer; this keeps the context in step
  const send = useCallback(async (path, options) => {
    const data = await api(path, options)
    if ('customer' in data) setCustomer(data.customer)
    return data
  }, [])

  const value = useMemo(() => ({
    customer,
    ready,
    setCustomer,
    logout: () => send('/account/logout', { method: 'POST' }),
    update: (details) => send('/account', { method: 'PUT', body: details }),
    saveAddress: (address) =>
      address.id
        ? send(`/account/addresses/${address.id}`, { method: 'PUT', body: address })
        : send('/account/addresses', { method: 'POST', body: address }),
    deleteAddress: (id) => send(`/account/addresses/${id}`, { method: 'DELETE' }),
  }), [customer, ready, send])

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
}

export const useAccount = () => useContext(AccountContext)
