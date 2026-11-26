import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

// The cart lives in the browser. Each line is
// { key, productId, name, color, size, quantity, unitPrice, image, design? }
// unitPrice here is only for display: the server prices every order itself.
const STORAGE_KEY = 'zuno-cart'
const MAX_QUANTITY = 20
const CartContext = createContext(null)

function loadSaved() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [lines, setLines] = useState(loadSaved)
  const [lastAdded, setLastAdded] = useState(null) // { ...line, at } for the "Added to bag" sheet
  const dismissAdded = useCallback(() => setLastAdded(null), [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
    } catch {
      // Storage is full (custom designs are large) or blocked: the cart still works until the tab closes
    }
  }, [lines])

  const value = useMemo(() => {
    const add = (line) => {
      setLastAdded({ ...line, at: Date.now() })
      setLines((current) => {
        // The same product, colour and size is one line with a higher quantity; every custom tee is its own line
        const same = !line.design && current.find(
          (l) => !l.design && l.productId === line.productId && l.color === line.color && l.size === line.size,
        )
        if (!same) return [...current, { ...line, key: crypto.randomUUID(), quantity: line.quantity ?? 1 }]
        return current.map((l) => (l === same ? { ...l, quantity: Math.min(MAX_QUANTITY, l.quantity + 1) } : l))
      })
    }
    const setQuantity = (key, quantity) =>
      setLines((current) =>
        current.map((l) => (l.key === key ? { ...l, quantity: Math.max(1, Math.min(MAX_QUANTITY, quantity)) } : l)),
      )
    const remove = (key) => setLines((current) => current.filter((l) => l.key !== key))
    const clear = () => {
      setLines([])
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch {
        // The cart is still cleared in memory when storage is blocked.
      }
    }
    return {
      lines,
      add,
      setQuantity,
      remove,
      clear,
      lastAdded,
      dismissAdded,
      count: lines.reduce((sum, l) => sum + l.quantity, 0),
      total: lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0),
    }
  }, [lines, lastAdded, dismissAdded])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => useContext(CartContext)
