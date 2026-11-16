import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { CartProvider } from './cart'
import { AccountProvider } from './account'
import { WishlistProvider } from './wishlist'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AccountProvider>
        <CartProvider>
          <WishlistProvider>
            <App />
          </WishlistProvider>
        </CartProvider>
      </AccountProvider>
    </BrowserRouter>
  </StrictMode>,
)
