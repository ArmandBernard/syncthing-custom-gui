export type AuthMode = 'static' | 'ldap'

export interface GUIConfiguration {
  enabled: boolean
  address: string
  unixSocketPermissions: string
  user: string
  /** Accepts either a bcrypt hash (stored verbatim) or plaintext (hashed
   *  server-side on write) when sent via PUT/PATCH /config/gui. */
  password: string
  authMode: AuthMode
  metricsWithoutAuth: boolean
  useTLS: boolean
  apiKey: string
  insecureAdminAccess: boolean
  theme: string
  insecureSkipHostcheck: boolean
  insecureAllowFrameLoading: boolean
  sendBasicAuthPrompt: boolean
  sessionCookieDurationS: number
  sessionCookiePath: string
}
