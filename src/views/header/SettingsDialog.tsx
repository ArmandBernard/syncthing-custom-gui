import { Dialog } from '@components/ui/Dialog.tsx'
import { TextField } from '@components/ui/TextField.tsx'
import { useState } from 'react'
import { Button } from '@components/ui/Button.tsx'
import { useSyncthingMutation } from '@hooks/useSyncthingMutation.ts'
import { ErrorAlert } from '@components/ui/ErrorAlert.tsx'
import { useAuth } from '@hooks/useAuth.ts'
import { useSyncthingQuery } from '@hooks/useSyncthingQuery.ts'
import { Tabs } from '@components/ui/tabs/Tabs.tsx'
import { Tab } from '@components/ui/tabs/Tab.tsx'
import { TabPanel } from '@components/ui/tabs/TabPanel.tsx'
import { TabsContextProvider } from '@components/ui/tabs/TabsContextProvider.tsx'
import type { GUIConfiguration } from '@lib/syncthing/types/config'
import type { SyncthingApiError } from '@lib/syncthing/SyncthingApiError.ts'

type SettingsDialogTabs = 'auth' | 'ignored-folders'

export default function SettingsDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const [currentTab, setCurrentTab] = useState<SettingsDialogTabs>('auth')
  const [user, setUser] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const { logout } = useAuth()

  const { mutateAsync, isPending, error } = useSyncthingMutation('PATCH /config/gui')
  const { data: guiConfig } = useSyncthingQuery('GET /config/gui', { enabled: isOpen })

  function handleClose() {
    setUser('')
    setPassword('')
    onClose()
  }

  async function handleSave() {
    await mutateAsync({
      body: {
        ...(user !== '' ? { user: user } : {}),
        ...(password !== '' ? { password } : {}),
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
      <TabsContextProvider selectedValue={currentTab} onSelect={(value) => setCurrentTab(value)}>
        <Tabs>
          <Tab value="auth" label="Authentication" />
          <Tab value="ignored-folders" label="Ignored folders" />
        </Tabs>
        <TabPanel value="auth" className="pt-4">
          <AuthSettings
            guiConfig={guiConfig}
            error={error}
            user={user}
            setUser={setUser}
            password={password}
            setPassword={setPassword}
          />
        </TabPanel>
        <TabPanel value="ignored-folders" className="pt-4"></TabPanel>
      </TabsContextProvider>
    </Dialog>
  )
}

function AuthSettings({
  guiConfig,
  error,
  user,
  setUser,
  password,
  setPassword,
}: {
  guiConfig: GUIConfiguration | undefined
  error: SyncthingApiError | null
  user: string
  setUser: (value: string) => void
  password: string
  setPassword: (value: string) => void
}) {
  const effectiveUser = user ?? guiConfig?.user

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-on-surface-variant">
        Set a GUI username and password to require login. Leave both blank to allow unauthenticated
        access.
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
  )
}
