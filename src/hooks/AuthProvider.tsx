import { type ReactNode, Suspense, useCallback, useEffect, useState } from 'react'
import { useSyncthingQuery } from './useSyncthingQuery'
import { AuthContext, type AuthStatus } from './AuthContext'
import { CircularProgressCentred } from '@components/CircularProgressCentred.tsx'
import { lazy } from 'preact/compat'
import { useSyncthingMutation } from '@hooks/useSyncthingMutation.ts'
import type { RequestOptions } from '@lib/syncthing/RequestOptions.ts'
import type { EndpointMap } from '@lib/syncthing/endpoints.ts'

const LoginForm = lazy(() => import('../views/LoginForm.tsx'))

const POLL_INTERVAL_MS = 30000

export function AuthProvider({ children }: { children: ReactNode }) {
  // Unauthenticated by default, so this is the one query allowed to run
  // before we know the auth status at all — it's how that status is found.
  const { error, isSuccess, isError, refetch } = useSyncthingQuery('GET /system/ping', {
    refetchInterval: POLL_INTERVAL_MS,
  })

  // react-query resets status/error to "pending"/null at the start of every
  // background refetch when this query has never had cached data (true here,
  // since it only ever errors while unauthenticated) — so reading isLoading/
  // error directly would flip the UI to "checking" on every 30s poll,
  // unmounting LoginForm mid-typing. Only update on a settled result instead.
  const [status, setStatus] = useState<AuthStatus>('checking')

  useEffect(() => {
    if (isSuccess) {
      setStatus('authed')
    } else if (isError) {
      setStatus(error.status === 401 || error.status === 403 ? 'unauthorized' : 'offline')
    }
  }, [isSuccess, isError, error])

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

  return <AuthContext.Provider value={{ status, login, logout }}>{children}</AuthContext.Provider>
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
