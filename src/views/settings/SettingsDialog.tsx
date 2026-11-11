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
import { IgnoredFolders, type IgnoredFolderRef } from './IgnoredFolders.tsx'
import { useSyncthingBatchMutation } from '@hooks/useSyncthingBatchMutation.ts'
import type { DeviceConfiguration } from '@lib/syncthing/types/config'

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
  const [queuedFolderRemovals, setQueuedFolderRemovals] = useState<IgnoredFolderRef[]>([])
  const { logout } = useAuth()

  const {
    mutateAsync,
    isPending: guiIsPending,
    error: guiError,
  } = useSyncthingMutation('PATCH /config/gui')
  const {
    mutateAsync: patchDevices,
    isPending: patchDevicesIsPending,
    error: patchDevicesError,
  } = useSyncthingBatchMutation('PATCH /config/devices/:id')
  const { data: guiConfig, error: configError } = useSyncthingQuery('GET /config/gui', {
    enabled: isOpen,
  })
  const { data: devices, error: devicesError } = useSyncthingQuery('GET /config/devices', {
    enabled: isOpen,
  })

  const isPending = guiIsPending || patchDevicesIsPending
  const error = guiError ?? devicesError ?? configError ?? patchDevicesError

  function handleClose() {
    setUser('')
    setPassword('')
    setQueuedFolderRemovals([])
    onClose()
  }

  async function handleSave() {
    // Before the GUI settings: changing the credentials logs the user out, which would
    // make any later request fail.
    const unignoreRequests = buildUnignoreRequests(devices, queuedFolderRemovals)
    if (unignoreRequests.length > 0) {
      await patchDevices(unignoreRequests)
    }

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
          <IgnoredFolders
            removed={queuedFolderRemovals}
            onRemove={(ignoredFolder) =>
              setQueuedFolderRemovals((removed) => [...removed, ignoredFolder])
            }
            error={error}
          />
        </TabPanel>
      </TabsContextProvider>
    </Dialog>
  )
}

function buildUnignoreRequests(
  devices: DeviceConfiguration[] | undefined,
  queuedFolderRemovals: IgnoredFolderRef[],
) {
  return (devices ?? []).flatMap((device) => {
    const removed = queuedFolderRemovals.filter((r) => r.deviceId === device.deviceID)
    if (removed.length === 0) {
      return []
    }

    return {
      params: { id: device.deviceID },
      body: {
        ignoredFolders: device.ignoredFolders.filter(
          (folder) => !removed.some((r) => r.folderId === folder.id),
        ),
      },
    }
  })
}
