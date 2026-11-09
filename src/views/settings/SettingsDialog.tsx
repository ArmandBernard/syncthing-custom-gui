import { Dialog } from '@components/ui/Dialog.tsx'
import { useState } from 'react'
import { Button } from '@components/ui/Button.tsx'
import { useSyncthingMutation } from '@hooks/useSyncthingMutation.ts'
import { useAuth } from '@hooks/useAuth.ts'
import { useSyncthingQuery } from '@hooks/useSyncthingQuery.ts'
import { Tabs } from '@components/ui/tabs/Tabs.tsx'
import { Tab } from '@components/ui/tabs/Tab.tsx'
import { TabPanel } from '@components/ui/tabs/TabPanel.tsx'
import { TabsContextProvider } from '@components/ui/tabs/TabsContextProvider.tsx'
import { AuthSettings } from './AuthSettings.tsx'
import { IgnoredFolders } from './IgnoredFolders.tsx'

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
      className="max-w-3xl w-full"
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
        <TabPanel value="ignored-folders" className="pt-4">
          <IgnoredFolders guiConfig={guiConfig} error={error} />
        </TabPanel>
      </TabsContextProvider>
    </Dialog>
  )
}
