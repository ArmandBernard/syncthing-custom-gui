import { syncthingRequest } from '@lib/syncthing/syncthingRequest.ts'

export async function login(
  username: string,
  password: string,
  stayLoggedIn: boolean,
): Promise<void> {
  await syncthingRequest('POST /noauth/auth/password', {
    body: { username, password, stayLoggedIn },
  })
}

export async function logout(): Promise<void> {
  await syncthingRequest('POST /noauth/auth/logout', {})
}
