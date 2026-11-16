import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import Home from './pages/Home'
import Product from './pages/Product'
import About from './pages/About'
import Cart from './pages/Cart'
import Account from './pages/Account'
import AccountOrder from './pages/AccountOrder'
import NotFound from './pages/NotFound'
import ShopGender from './pages/ShopGender'
import Contact from './pages/Contact'
import Orders from './pages/Orders'
import Wishlist from './pages/Wishlist'

// The design studio pulls in the canvas library, so it is only loaded when visited
const Design = lazy(() => import('./pages/Design'))
const loading = <p className="py-24 text-center text-ink/50">Loading…</p>

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/design" element={<Suspense fallback={loading}><Design /></Suspense>} />
          <Route path="/shop-women" element={<ShopGender key="women" gender="women" />} />
          <Route path="/shop-men" element={<ShopGender key="men" gender="men" />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/account" element={<Account />} />
          <Route path="/account/orders/:number" element={<AccountOrder />} />
          <Route path="*" element={<NotFound />} />        </Routes>
      </main>
      <Footer />
    </div>
  )
}
