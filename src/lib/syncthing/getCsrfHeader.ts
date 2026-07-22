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
// "/"). In production that's this app's own index.html, served directly by
// Syncthing, so the cookie already exists before any JS runs. In dev, Vite
// serves index.html itself and never proxies "/" to Syncthing, so the cookie
// never arrives on its own — fetch a proxied path once to pick it up.
export async function ensureCsrfCookie(): Promise<void> {
  if (Object.keys(getCsrfHeader()).length > 0) return
  await refreshCsrfCookie()
}

// The existing cookie can go stale (e.g. Syncthing regenerates its CSRF
// secret across a restart) without disappearing client-side, so a request
// can still get rejected even though ensureCsrfCookie() saw a cookie already
// present. Call this unconditionally to force a fresh one.
export async function refreshCsrfCookie(): Promise<void> {
  await fetch('/__syncthing_csrf_bootstrap', { credentials: 'include' }).catch(() => {})
}
