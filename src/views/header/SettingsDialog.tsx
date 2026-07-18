import { Dialog } from '@components/ui/Dialog.tsx'
import { TextField } from '@components/ui/TextField.tsx'
import { useState } from 'react'
import { Button } from '@components/ui/Button.tsx'
import { useSyncthingMutation } from '@hooks/useSyncthingMutation.ts'
import { ErrorAlert } from '@components/ui/ErrorAlert.tsx'
import { useAuth } from '@hooks/useAuth.ts'
import { useSyncthingQuery } from '@hooks/useSyncthingQuery.ts'

export default function SettingsDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const { data: guiConfig } = useSyncthingQuery('GET /config/gui', { enabled: isOpen })
  const { mutateAsync, isPending, error } = useSyncthingMutation('PATCH /config/gui')
  const [user, setUser] = useState<string | undefined>(undefined)
  const [password, setPassword] = useState<string | undefined>(undefined)
  const { logout } = useAuth()

  const effectiveUser = user ?? guiConfig?.user

  function handleClose() {
    setUser(undefined)
    setPassword(undefined)
    onClose()
  }

  async function handleSave() {
    await mutateAsync({
      body: {
        ...(user !== undefined ? { user: user } : {}),
        ...(password !== undefined ? { password } : {}),
      },
    })
    if (user || password) {
      await logout.mutateAsync()
    }
    handleClose()
  }

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      title="Settings"
      className="max-w-md"
      actions={
        <>
          <Button variant="outlined" disabled={isPending} onClick={handleClose}>
            Close
          </Button>
          <Button variant="filled" disabled={isPending} onClick={handleSave}>
            Save
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-on-surface-variant">
          Set a GUI username and password to require login. Leave both blank to allow
          unauthenticated access.
        </p>
        <TextField
          label="Username"
          value={effectiveUser ?? ''}
          onChange={(event) => setUser(event.currentTarget.value)}
          autoComplete="username"
        />
        <TextField
          type="password"
          label="Password"
          value={password ?? ''}
          onChange={(event) => setPassword(event.currentTarget.value)}
          autoComplete="new-password"
          supportingText="Leave blank to keep the current password."
        />
        {error && <ErrorAlert error={error} />}
      </div>
    </Dialog>
  )
}
