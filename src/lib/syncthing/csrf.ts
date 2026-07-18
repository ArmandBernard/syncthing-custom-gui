// Syncthing sets a `CSRF-Token-<unique>` cookie (readable, unlike the
// httpOnly session cookie) and expects it echoed back as the matching
// `X-CSRF-Token-<unique>` header on cookie-authenticated requests.
export function getCsrfHeader(): Record<string, string> {
  const cookie = document.cookie.split('; ').find((entry) => entry.startsWith('CSRF-Token-'))
  if (!cookie) return {}

  const separatorIndex = cookie.indexOf('=')
  const name = cookie.slice(0, separatorIndex)
  const value = cookie.slice(separatorIndex + 1)
  return { [`X-${name}`]: value }
}
