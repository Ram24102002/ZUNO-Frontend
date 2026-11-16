import { createContext, useContext, useEffect, useMemo, useState } from 'react'

// The wishlist lives in the browser, like the cart. Each entry is a snapshot of the product as the shop
// lists it ({ id, name, price, colors, images, ... }); the Wishlist page refreshes it from the API.
const STORAGE_KEY = 'zuno-wishlist'
const WishlistContext = createContext(null)

function loadSaved() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

/** Only the fields a product card needs, so storage stays small. */
const snapshot = (p) => ({
  id: p.id,
  name: p.name,
  price: p.price,
  tag: p.tag ?? null,
  soldOut: Boolean(p.soldOut),
  colors: p.colors ?? [],
  images: (p.images ?? []).slice(0, 2),
  rating: p.rating ?? null,
})

export function WishlistProvider({ children }) {
  const [items, setItems] = useState(loadSaved)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Storage blocked: the wishlist still works until the tab closes
    }
  }, [items])

  const value = useMemo(() => {
    const has = (id) => items.some((p) => p.id === id)
    const toggle = (product) =>
      setItems((current) =>
        current.some((p) => p.id === product.id)
          ? current.filter((p) => p.id !== product.id)
          : [snapshot(product), ...current],
      )
    const remove = (id) => setItems((current) => current.filter((p) => p.id !== id))
    const refresh = (fresh) =>
      setItems((current) => current.map((p) => (fresh[p.id] ? snapshot(fresh[p.id]) : p)))
    return { items, has, toggle, remove, refresh, count: items.length }
  }, [items])

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export const useWishlist = () => useContext(WishlistContext)
