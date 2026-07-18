import { createContext } from 'react'
import type { RequestOptions } from '@lib/syncthing/RequestOptions.ts'
import type { EndpointMap } from '@lib/syncthing/endpoints.ts'
import type { SyncthingApiError } from '@lib/syncthing/SyncthingApiError.ts'

export type AuthStatus = 'checking' | 'authed' | 'unauthorized' | 'offline'

export interface AuthContextValue {
  status: AuthStatus
  login: {
    mutateAsync: (
      options: RequestOptions<EndpointMap['POST /noauth/auth/password']>,
    ) => Promise<void>
    error: SyncthingApiError | null
    isPending: boolean
  }
  logout: {
    mutateAsync: () => Promise<void>
    error: SyncthingApiError | null
    isPending: boolean
  }
}

export const AuthContext = createContext<AuthContextValue | null>(null)
