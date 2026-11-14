import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Product from './pages/Product'
import About from './pages/About'
import Cart from './pages/Cart'
import Account from './pages/Account'
import AccountOrder from './pages/AccountOrder'
import ResetPassword from './pages/ResetPassword'

// The design studio pulls in the canvas library, so it is only loaded when visited
const Design = lazy(() => import('./pages/Design'))
const loading = <p className="py-24 text-center text-ink/50">Loading…</p>

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/design" element={<Suspense fallback={loading}><Design /></Suspense>} />
          <Route path="/about" element={<About />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/account" element={<Account />} />
          <Route path="/account/orders/:number" element={<AccountOrder />} />
          <Route path="/account/reset-password" element={<ResetPassword />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
