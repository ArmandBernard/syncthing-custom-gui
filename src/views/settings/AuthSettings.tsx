import type { GUIConfiguration } from '@lib/syncthing/types/config'
import type { SyncthingApiError } from '@lib/syncthing/SyncthingApiError.ts'
import { TextField } from '@components/ui/TextField.tsx'
import { ErrorAlert } from '@components/ui/ErrorAlert.tsx'

interface AuthSettingsProps {
  guiConfig: GUIConfiguration | undefined
  error: SyncthingApiError | null
  user: string
  setUser: (value: string) => void
  password: string
  setPassword: (value: string) => void
}

export function AuthSettings({
  guiConfig,
  error,
  user,
  setUser,
  password,
  setPassword,
}: AuthSettingsProps) {
  const effectiveUser = user ? user : (guiConfig?.user ?? '')

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-on-surface-variant">
        Set a GUI username and password to require login. Leave both blank to allow unauthenticated
        access.
      </p>
      <TextField
        label="Username"
        value={effectiveUser}
        onChange={(event) => setUser(event.currentTarget.value)}
        autoComplete="username"
      />
      <TextField
        type="password"
        label="Password"
        value={password}
        onChange={(event) => setPassword(event.currentTarget.value)}
        autoComplete="new-password"
        supportingText="Leave blank to keep the current password."
      />
      {error && <ErrorAlert error={error} />}
    </div>
  )
}
