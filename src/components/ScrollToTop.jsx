import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Reloads and back/forward also open at the top instead of the browser's remembered position
if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual'

/**
 * Every page opens at the top. A link with a #section (e.g. "/#shop") scrolls to that section instead.
 * Only the page address counts, so changing shop filters (?category=…) doesn't move the page.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useLayoutEffect(() => {
    if (hash) {
      const target = document.getElementById(hash.slice(1))
      if (target) {
        target.scrollIntoView()
        return
      }
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])

  return null
}
