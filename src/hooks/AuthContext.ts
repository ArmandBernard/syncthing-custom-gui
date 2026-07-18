import { createContext } from 'react'

export type AuthStatus = 'checking' | 'authed' | 'unauthorized' | 'offline'

export interface AuthContextValue {
  status: AuthStatus
  login: (username: string, password: string, stayLoggedIn: boolean) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
