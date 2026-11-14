import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { CartProvider } from './cart'
import { AccountProvider } from './account'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AccountProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AccountProvider>
    </BrowserRouter>
  </StrictMode>,
)
