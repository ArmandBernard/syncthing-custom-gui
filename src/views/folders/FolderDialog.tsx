import { Dialog } from '@components/ui/Dialog.tsx'
import { TextField } from '@components/ui/TextField.tsx'
import { useState } from 'react'
import type { FolderConfiguration, FolderDeviceConfiguration } from '@lib/syncthing/types/config'
import { Button } from '@components/ui/Button.tsx'
import { useSyncthingMutation } from '@hooks/useSyncthingMutation.ts'
import { useSyncthingQuery } from '@hooks/useSyncthingQuery.ts'
import { useCreateFolderId } from '@hooks/useCreateFolderId.ts'
import { mergeConfigurations } from '@lib/mergeConfigurations.ts'
import { Tabs } from '@components/ui/tabs/Tabs.tsx'
import { TabPanel } from '@components/ui/tabs/TabPanel.tsx'
import { TabsContextProvider } from '@components/ui/tabs/TabsContextProvider.tsx'
import { Tab } from '@components/ui/tabs/Tab.tsx'
import type { DeviceID } from '@lib/syncthing/types/common.ts'
import { Checkbox } from '@components/ui/Checkbox.tsx'
import { useDeviceID } from '@context/device-id/useDeviceID.ts'
import { CircularProgressCentred } from '@components/CircularProgressCentred.tsx'
import { ErrorAlert } from '@components/ui/ErrorAlert.tsx'

type FolderDialogTabs = 'general' | 'sharing'

export default function FolderDialog({
  initialConfig,
  editing,
  isOpen,
  onClose,
}: {
  initialConfig: FolderConfiguration | undefined
  editing: boolean
  isOpen: boolean
  onClose: () => void
}) {
  const [folderConfigChanges, setFolderConfigChanges] = useState<Partial<FolderConfiguration>>({})
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [currentTab, setCurrentTab] = useState<FolderDialogTabs>('general')

  const newFolderId = useCreateFolderId()
  const { data: defaultFolderConfig } = useSyncthingQuery('GET /config/defaults/folder')
  const {
    mutateAsync: updateFolderAsync,
    isPending: updateFolderIsPending,
    error: updateFolderError,
  } = useSyncthingMutation('PATCH /config/folders/:id')
  const {
    mutateAsync: createFolderAsync,
    isPending: createFolderIsPending,
    error: createFolderError,
  } = useSyncthingMutation('POST /config/folders')
  const {
    mutateAsync: deleteFolderAsync,
    isPending: deleteFolderIsPending,
    error: deleteFolderError,
  } = useSyncthingMutation('DELETE /config/folders/:id')

  const isPending = updateFolderIsPending || createFolderIsPending || deleteFolderIsPending
  const error = updateFolderError || createFolderError || deleteFolderError

  const effectiveConfig: FolderConfiguration | undefined = mergeConfigurations(
    defaultFolderConfig,
    newFolderId ? { id: newFolderId } : undefined,
    initialConfig,
    folderConfigChanges,
  )

  function handleClickDelete() {
    setConfirmingDelete(true)
  }
  function handleCancelConfirmDelete() {
    setConfirmingDelete(false)
  }
  async function handleConfirmDelete() {
    if (initialConfig) {
      await deleteFolderAsync({ params: { id: initialConfig.id } })
      setConfirmingDelete(false)
      onClose()
    }
  }

  async function handleSave() {
    if (!effectiveConfig) {
      return
    }

    if (editing) {
      await updateFolderAsync({
        params: { id: effectiveConfig.id },
        body: effectiveConfig,
      })
    } else if (newFolderId) {
      await createFolderAsync({
        body: { ...effectiveConfig, id: newFolderId },
      })
    }
    onClose()
  }

  function handleUpdateConfiguration(configUpdates: Partial<FolderConfiguration>) {
    setFolderConfigChanges((old) => {
      return { ...old, ...configUpdates }
    })
  }

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      centred={false}
      className="max-w-xl w-full"
      title={
        <>
          {editing ? 'Edit' : 'Create'} folder{' '}
          <span className="text-on-surface-variant">{!editing ? ` (${newFolderId})` : ''}</span>
        </>
      }
      actions={
        <div className="flex flex-1 gap-4 justify-between">
          <div>
            {editing && (
              <Button variant="tonal" disabled={isPending} onClick={handleClickDelete}>
                Delete
              </Button>
            )}
          </div>
          <div className="flex gap-4">
            <Button variant="outlined" disabled={isPending} onClick={onClose}>
              Close
            </Button>
            <Button variant="filled" disabled={isPending} onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      }
    >
      {effectiveConfig && (
        <div>
          {error && <ErrorAlert error={error} />}
          <TabsContextProvider
            selectedValue={currentTab}
            onSelect={(value) => setCurrentTab(value)}
          >
            <Tabs value="general" onChange={() => {}}>
              <Tab value="general" label="General" />
              <Tab value="sharing" label="Sharing" />
            </Tabs>
            <TabPanel value="general" className="pt-4">
              <GeneralForm
                effectiveConfig={effectiveConfig}
                onUpdateConfiguration={handleUpdateConfiguration}
              />
            </TabPanel>
            <TabPanel value="sharing" className="pt-4">
              <SharingForm
                effectiveConfig={effectiveConfig}
                onUpdateConfiguration={handleUpdateConfiguration}
              />
            </TabPanel>
          </TabsContextProvider>
        </div>
      )}
      <Dialog
        title="Confirm deletion"
        open={confirmingDelete}
        onClose={handleCancelConfirmDelete}
        actions={
          <>
            <Button variant="outlined" disabled={isPending} onClick={handleCancelConfirmDelete}>
              Cancel
            </Button>
            <Button variant="tonal" disabled={isPending} onClick={handleConfirmDelete}>
              Confirm
            </Button>
          </>
        }
      >
        <div>Are you sure you want to delete this folder?</div>
      </Dialog>
    </Dialog>
  )
}

function GeneralForm({
  effectiveConfig,
  onUpdateConfiguration,
}: {
  effectiveConfig: FolderConfiguration
  onUpdateConfiguration: (configUpdates: Partial<FolderConfiguration>) => void
}) {
  const { data: status } = useSyncthingQuery('GET /system/status')

  return (
    <div className="flex flex-col gap-4">
      <TextField
        label="Label"
        value={effectiveConfig.label}
        onChange={(e) => onUpdateConfiguration({ label: e.currentTarget?.value })}
        supportingText="Optional descriptive label for the folder."
      />
      <TextField
        label="Group"
        value={effectiveConfig.group}
        onChange={(e) => onUpdateConfiguration({ group: e.currentTarget?.value })}
        supportingText="Optional group for the folder."
      />
      <TextField
        label="Path"
        value={effectiveConfig.path}
        onChange={(e) => onUpdateConfiguration({ path: e.currentTarget?.value })}
        supportingText={
          <>
            Path to the folder on the local computer. Will be created if it does not exist.
            {status && (
              <>
                {' '}
                The tilde character (~) can be used as a shortcut for{' '}
                <code className="bg-surface p-0.5 rounded-xs">{status.tilde}</code>.
              </>
            )}
          </>
        }
      />
    </div>
  )
}

function SharingForm({
  effectiveConfig,
  onUpdateConfiguration,
}: {
  effectiveConfig: FolderConfiguration
  onUpdateConfiguration: (configUpdates: Partial<FolderConfiguration>) => void
}) {
  const myDeviceId = useDeviceID()
  const { data: devicesIncludingMe, isLoading: devicesLoading } =
    useSyncthingQuery('GET /config/devices')

  if (devicesLoading || !devicesIncludingMe) {
    return <CircularProgressCentred name="devices" />
  }

  function handleShareDevice(device: FolderDeviceConfiguration) {
    onUpdateConfiguration({ devices: [...effectiveConfig.devices, device] })
  }

  function handleUnshareDevice(deviceId: DeviceID) {
    onUpdateConfiguration({
      devices: effectiveConfig.devices.filter((d) => d.deviceID !== deviceId),
    })
  }

  const devices = devicesIncludingMe.filter((d) => d.deviceID !== myDeviceId)
  const sharedDeviceIds = new Set<DeviceID>(effectiveConfig.devices.map((d) => d.deviceID))

  return (
    <div className="flex flex-col gap-4">
      <h2>Devices</h2>
      <ul>
        {devices.map((device) => {
          const shared = sharedDeviceIds.has(device.deviceID)

          return (
            <li key={device.deviceID} className="flex gap-4 justify-between items-center">
              <Checkbox
                label={device.name}
                className="flex-1"
                checked={shared}
                onChange={(event) => {
                  if (event.currentTarget.checked) {
                    handleShareDevice({
                      deviceID: device.deviceID,
                      encryptionPassword: '',
                      introducedBy: '',
                    })
                  } else {
                    handleUnshareDevice(device.deviceID)
                  }
                }}
              />
            </li>
          )
        })}
      </ul>
    </div>
  )
}
