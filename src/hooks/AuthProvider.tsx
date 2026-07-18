import { useCallback, type ReactNode, Suspense } from 'react'
import { useSyncthingQuery } from './useSyncthingQuery'
import { AuthContext, type AuthStatus } from './AuthContext'
import { CircularProgressCentred } from '@components/CircularProgressCentred.tsx'
import { lazy } from 'preact/compat'
import { syncthingRequest } from '@lib/syncthing/syncthingRequest.ts'

const LoginForm = lazy(() => import('../views/LoginForm.tsx'))

const POLL_INTERVAL_MS = 30000

export function AuthProvider({ children }: { children: ReactNode }) {
  // Unauthenticated by default, so this is the one query allowed to run
  // before we know the auth status at all — it's how that status is found.
  const { error, isPending, refetch } = useSyncthingQuery('GET /system/ping', {
    refetchInterval: POLL_INTERVAL_MS,
  })

  const status: AuthStatus = isPending
    ? 'checking'
    : error
      ? error.status === 401 || error.status === 403
        ? 'unauthorized'
        : 'offline'
      : 'authed'

  const login = useCallback(
    async (username: string, password: string, stayLoggedIn: boolean) => {
      await syncthingRequest('POST /noauth/auth/password', {
        body: { username, password, stayLoggedIn },
      })
      await refetch()
    },
    [refetch],
  )

  const logout = useCallback(async () => {
    await syncthingRequest('POST /noauth/auth/logout', {})
    await refetch()
  }, [refetch])

  if (status === 'checking') {
    return null
  }

  if (status === 'unauthorized') {
    return (
      <main className="flex flex-1 flex-col min-h-screen">
        <Suspense fallback={<CircularProgressCentred name="login" />}>
          <LoginForm onLogin={login} />
        </Suspense>
      </main>
    )
  }

  return <AuthContext.Provider value={{ status, login, logout }}>{children}</AuthContext.Provider>
}
