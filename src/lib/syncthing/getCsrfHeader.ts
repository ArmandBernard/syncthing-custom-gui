// Syncthing sets a `CSRF-Token-<unique>` cookie (readable, unlike the
// httpOnly session cookie) and expects it echoed back as the matching
// `X-CSRF-Token-<unique>` header on cookie-authenticated requests.
export function getCsrfHeader(): Record<string, string> {
  const cookie = document.cookie.split('; ').find((entry) => entry.startsWith('CSRF-Token-'))
  if (!cookie) {
    return {}
  }

  const separatorIndex = cookie.indexOf('=')
  const name = cookie.slice(0, separatorIndex)
  const value = cookie.slice(separatorIndex + 1)
  return { [`X-${name}`]: value }
}

// Syncthing only issues the CSRF-Token cookie while serving a GUI page (e.g.
// "/"), never from plain REST calls — so a request can fail with a CSRF
// error before any cookie has ever been set (first load) or after a
// previously valid one has gone stale (e.g. Syncthing regenerated its secret
// across a restart). Either way the fix is the same: fetch a GUI page to
// pick up a fresh cookie and retry. In production that page is this app's
// own index.html, served directly by Syncthing. In dev, Vite serves
// index.html itself and never proxies "/" to Syncthing, so a dedicated
// proxied path stands in for it instead.
export async function refreshCsrfCookie(): Promise<void> {
  const path = import.meta.env.DEV ? '/__syncthing_csrf_bootstrap' : '/index.html'
  await fetch(path, { credentials: 'include' }).catch(() => {})
}
