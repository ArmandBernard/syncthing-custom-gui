import type { ComponentChildren } from 'preact'
import { useCallback, useState } from 'preact/hooks'
import { lazy, Suspense } from 'preact/compat'
import { useSyncthingQuery } from './useSyncthingQuery'
import { AuthContext, type AuthStatus } from './AuthContext'
import { CircularProgressCentred } from '@components/CircularProgressCentred.tsx'
import { useSyncthingMutation } from '@hooks/useSyncthingMutation.ts'
import type { RequestOptions } from '@lib/syncthing/RequestOptions.ts'
import type { EndpointMap } from '@lib/syncthing/endpoints.ts'

const LoginForm = lazy(() => import('../views/LoginForm.tsx'))

const POLL_INTERVAL_MS = 30000

export function AuthProvider({ children }: { children: ComponentChildren }) {
  // Allowed to run unauthenticated
  const { error, isSuccess, isError, refetch } = useSyncthingQuery('GET /system/ping', {
    refetchInterval: POLL_INTERVAL_MS,
  })
  const [status, setStatus] = useState<AuthStatus>('checking')

  const computedStatus: AuthStatus | undefined = isSuccess
    ? 'authed'
    : isError
      ? error.status === 401 || error.status === 403
        ? 'unauthorized'
        : 'offline'
      : undefined

  // The query returns to `pending` when it refetches after an error if it has never succeeded.
  // Remember the last settled status so we never fall back to 'checking' once we've seen a result,
  // which would unmount the login screen.
  if (computedStatus !== undefined && computedStatus !== status) {
    setStatus(computedStatus)
  }

  const login = useLogin(refetch)
  const logout = useLogout(refetch)

  if (status === 'unauthorized') {
    return (
      <AuthContext.Provider value={{ status, login, logout }}>
        <main className="flex flex-1 flex-col min-h-screen">
          <Suspense fallback={<CircularProgressCentred name="login" />}>
            <LoginForm />
          </Suspense>
        </main>
      </AuthContext.Provider>
    )
  }

  return (
    <AuthContext.Provider value={{ status: status, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

function useLogin(refetch: () => Promise<unknown>) {
  const { mutateAsync, error, isPending } = useSyncthingMutation('POST /noauth/auth/password')

  const handleLogin = useCallback(
    async (props: RequestOptions<EndpointMap['POST /noauth/auth/password']>) => {
      await mutateAsync(props)
      void refetch()
    },
    [mutateAsync, refetch],
  )

  return {
    mutateAsync: handleLogin,
    error,
    isPending,
  }
}

function useLogout(refetch: () => Promise<unknown>) {
  const { mutateAsync, error, isPending } = useSyncthingMutation('POST /noauth/auth/logout')

  const handleLogout = useCallback(async () => {
    await mutateAsync({})
    void refetch()
  }, [mutateAsync, refetch])

  return {
    mutateAsync: handleLogout,
    error,
    isPending,
  }
}
