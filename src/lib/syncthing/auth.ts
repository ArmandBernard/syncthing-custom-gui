import { SyncthingApiError } from './client'

// These hit /rest/noauth/..., which is unauthenticated (and CSRF-exempt), so
// they bypass syncthingRequest entirely rather than pretending to fit its
// EndpointMap-typed, cookie/CSRF-header-injecting request shape.
export async function login(
  username: string,
  password: string,
  stayLoggedIn: boolean,
): Promise<void> {
  const response = await fetch('/rest/noauth/auth/password', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, stayLoggedIn }),
  })

  if (!response.ok) {
    throw new SyncthingApiError(response.status, 'Incorrect username or password')
  }
}

export async function logout(): Promise<void> {
  await fetch('/rest/noauth/auth/logout', {
    method: 'POST',
    credentials: 'include',
  }).catch(() => {})
}
