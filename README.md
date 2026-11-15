# ZUNO frontend

The shop for [@zuno.clo](https://www.instagram.com/zuno.clo/), built with React, Vite and Tailwind. It talks to the
Bagisto backend (the `zuno-backend` repo) through `/api/zuno/*`. Product photos come from the backend's `/storage/*`.

## Run locally

Start the backend first (see the `zuno-backend` README). It runs on http://localhost:8000.

```bash
npm install
npm run dev        # http://localhost:5173
```

The Vite dev server forwards `/api/zuno` and `/storage` to `http://localhost:8000`. To use another backend, set
`ZUNO_BACKEND_URL`, for example `ZUNO_BACKEND_URL=https://140-245-225-16.sslip.io npm run dev`.

## Deploy (Vercel)

Import this repo at [vercel.com/new](https://vercel.com/new). There are no settings to change. Every push to `main`
deploys the site.

`vercel.json` forwards `/api/zuno/*` and `/storage/*` to the backend server, so shoppers only ever see the Vercel
domain. That matters because login cookies, checkout and Google sign-in depend on it. **If the backend's address
changes, update both destinations in `vercel.json`.**

## Structure

```
src/pages         Home, Product, Design, Cart, About, Account (Google sign-in only), AccountOrder, NotFound (404)
src/components    Shop (search + filters), Reviews, AddressForm, TeeEditor, Navbar, ...
src/api.js        API helper (session cookie + CSRF header)
src/account.jsx   the logged-in customer
src/cart.jsx      the cart, kept in the browser
```
