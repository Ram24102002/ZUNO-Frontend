// Runs after `vite build`. The app renders in the browser, so dist/index.html is an empty <div id="root">
// and Google sees almost nothing. This writes a copy of it per public page with its own title, description,
// canonical link and visible text (React replaces that text once it loads), plus a real sitemap.xml.
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

const SITE = 'https://www.zunostore.in'
const API = process.env.ZUNO_API_URL || 'https://129-225-119-92.sslip.io/api/zuno'
const DIST = 'dist'

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

const pages = [
  {
    path: '/',
    title: 'ZUNO — Oversized Streetwear T-Shirts | Wear the Mindset',
    description: 'Shop ZUNO oversized streetwear T-shirts for men and women. Heavyweight cotton, bold graphics, made in India.',
    body: '<h1>ZUNO — Wear the Mindset</h1><p>Oversized streetwear T-shirts for men and women.</p>',
  },
  {
    path: '/shop-men',
    title: "Men's Oversized T-Shirts | ZUNO",
    description: "Shop ZUNO men's oversized streetwear T-shirts. Heavyweight cotton and bold graphic tees.",
    body: "<h1>Men's Oversized T-Shirts</h1>",
  },
  {
    path: '/shop-women',
    title: "Women's Oversized T-Shirts | ZUNO",
    description: "Shop ZUNO women's oversized streetwear T-shirts. Heavyweight cotton and bold graphic tees.",
    body: "<h1>Women's Oversized T-Shirts</h1>",
  },
  {
    path: '/about',
    title: 'About ZUNO | Wear the Mindset',
    description: 'ZUNO is a streetwear label making oversized T-shirts built for the gym and the street.',
    body: '<h1>About ZUNO</h1>',
  },
  {
    path: '/contact',
    title: 'Contact ZUNO',
    description: 'Get in touch with ZUNO for orders, sizing and support.',
    body: '<h1>Contact ZUNO</h1>',
  },
]

// The backend may be restarting (a backend deploy at the same time), so try a few times
let products = []
for (let attempt = 1; attempt <= 4; attempt++) {
  try {
    const res = await fetch(`${API}/products`, { signal: AbortSignal.timeout(15000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    products = await res.json()
    break
  } catch (err) {
    if (attempt === 4) console.warn(`[seo] Could not load products (${err.message}); product pages left out of the sitemap.`)
    else await new Promise((r) => setTimeout(r, 15000))
  }
}

const productLinks = products
  .map((p) => `<li><a href="/product/${esc(p.id)}">${esc(p.name)} — ₹${esc(p.price)}</a></li>`)
  .join('')
for (const page of pages.slice(0, 3)) if (productLinks) page.body += `<ul>${productLinks}</ul>`

for (const p of products) {
  const image = p.images?.[0] ? SITE + p.images[0] : undefined
  const inStock = !p.soldOut && (p.variants ?? []).some((v) => v.inStock)
  pages.push({
    path: `/product/${p.id}`,
    title: `${p.name} | ZUNO`,
    description: String(p.description || `${p.name} by ZUNO.`).slice(0, 160),
    image,
    body: `<h1>${esc(p.name)}</h1><p>₹${esc(p.price)}</p><p>${esc(p.description)}</p>`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: p.name,
      description: p.description,
      image: image ? [image] : undefined,
      brand: { '@type': 'Brand', name: 'ZUNO' },
      offers: {
        '@type': 'Offer',
        url: `${SITE}/product/${p.id}`,
        priceCurrency: 'INR',
        price: p.price,
        availability: `https://schema.org/${inStock ? 'InStock' : 'OutOfStock'}`,
      },
    },
  })
}

const template = await readFile(join(DIST, 'index.html'), 'utf8')

for (const page of pages) {
  const url = SITE + page.path
  const head = [
    `<title>${esc(page.title)}</title>`,
    `<meta name="description" content="${esc(page.description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="${page.jsonLd ? 'product' : 'website'}" />`,
    `<meta property="og:site_name" content="ZUNO" />`,
    `<meta property="og:title" content="${esc(page.title)}" />`,
    `<meta property="og:description" content="${esc(page.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    page.image && `<meta property="og:image" content="${esc(page.image)}" />`,
    page.jsonLd && `<script type="application/ld+json">${JSON.stringify(page.jsonLd).replace(/</g, '\\u003c')}</script>`,
  ]
    .filter(Boolean)
    .join('\n    ')

  const html = template
    .replace(/<title>[\s\S]*?<\/title>/, '')
    .replace(/<meta name="description"[^>]*>/, '')
    .replace('</head>', `    ${head}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${page.body}</div>`)

  const file = page.path === '/' ? join(DIST, 'index.html') : join(DIST, page.path, 'index.html')
  await mkdir(dirname(file), { recursive: true })
  await writeFile(file, html)
}

const today = new Date().toISOString().slice(0, 10)
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url><loc>${SITE}${p.path}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`
await writeFile(join(DIST, 'sitemap.xml'), sitemap)
console.log(`[seo] Wrote ${pages.length} pages and sitemap.xml`)
