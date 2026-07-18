// Syncthing serves QR codes from /qr/, outside the /rest namespace. Cookie
// auth works here for free since the browser attaches cookies automatically.
import { getCsrfHeader } from '@lib/syncthing/getCsrfHeader'
import { SyncthingApiError } from '@lib/syncthing/SyncthingApiError.ts'

export async function fetchQrCode(text: string): Promise<Blob> {
  const url = `/qr/?text=${encodeURIComponent(text)}`
  const response = await fetch(url, { credentials: 'include', headers: getCsrfHeader() })

  if (!response.ok) {
    const message = await response.text().catch(() => '')
    throw new SyncthingApiError(response.status, message || response.statusText)
  }

  return response.blob()
}
