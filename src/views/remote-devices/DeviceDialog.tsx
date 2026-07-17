import { Dialog } from '@components/ui/Dialog.tsx'
import { TextField } from '@components/ui/TextField.tsx'
import { useState } from 'react'
import type { DeviceConfiguration, FolderConfiguration } from '@lib/syncthing/types/config'
import { Button } from '@components/ui/Button.tsx'
import { useSyncthingMutation } from '@hooks/useSyncthingMutation.ts'
import { useSyncthingQuery } from '@hooks/useSyncthingQuery.ts'
import { mergeConfigurations } from '@lib/mergeConfigurations.ts'
import type { DeviceID } from '@lib/syncthing/types/common.ts'
import { DeviceIDText } from '@components/DeviceIDText.tsx'

export default function DeviceDialog({
  initialConfig,
  isOpen,
  onClose,
}: {
  initialConfig: DeviceConfiguration | undefined
  isOpen: boolean
  onClose: () => void
}) {
  const [folderConfigChanges, setFolderConfigChanges] = useState<Partial<FolderConfiguration>>({})
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const { data: defaultDeviceConfig } = useSyncthingQuery('GET /config/defaults/device')
  const { mutateAsync: updateFolderAsync, isPending: updateFolderIsPending } = useSyncthingMutation(
    'PATCH /config/devices/:id',
  )
  const { mutateAsync: deleteFolderAsync, isPending: deleteFolderIsPending } = useSyncthingMutation(
    'DELETE /config/devices/:id',
  )
  const { mutateAsync: createFolderAsync, isPending: createFolderIsPending } =
    useSyncthingMutation('POST /config/devices')

  const isPending = updateFolderIsPending || createFolderIsPending || deleteFolderIsPending
  const inEditMode = !!initialConfig
  const effectiveConfig: DeviceConfiguration | undefined = mergeConfigurations(
    defaultDeviceConfig,
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
      await deleteFolderAsync({ params: { id: initialConfig.deviceID } })
      setConfirmingDelete(false)
      onClose()
    }
  }

  async function handleSave() {
    if (!effectiveConfig) {
      return
    }

    if (inEditMode) {
      await updateFolderAsync({
        params: { id: effectiveConfig.deviceID },
        body: effectiveConfig,
      })
    } else {
      await createFolderAsync({
        body: { ...effectiveConfig },
      })
    }
    onClose()
  }

  function handleUpdateField(configUpdates: Partial<DeviceConfiguration>) {
    setFolderConfigChanges((old) => {
      return { ...old, ...configUpdates }
    })
  }

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title={<>{inEditMode ? 'Edit' : 'Add remote'} device</>}
      className="max-w-2xl"
      actions={
        <div className="flex flex-1 gap-4 justify-between">
          <div>
            {inEditMode && (
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
        <div className="flex flex-col gap-4">
          {inEditMode ? (
            <DeviceIDText deviceID={effectiveConfig.deviceID} />
          ) : (
            <TextField
              label="ID"
              value={effectiveConfig.deviceID}
              onChange={(e) => handleUpdateField({ deviceID: e.currentTarget?.value as DeviceID })}
              supportingText="The device ID to enter here can be found in the 'Actions > Show ID' dialog on the other device. Spaces and dashes are optional (ignored). When adding a new device, keep in mind that this device must be added on the other side too."
            />
          )}
          <TextField
            label="Name"
            variant="filled"
            value={effectiveConfig.name}
            onChange={(e) => handleUpdateField({ name: e.currentTarget?.value })}
            supportingText="Shown instead of Device ID in the cluster status. Will be updated to the name the device advertises if left empty."
          />
          <TextField
            label="Group"
            value={effectiveConfig.group}
            onChange={(e) => handleUpdateField({ group: e.currentTarget?.value })}
            supportingText="Optional group for the device."
          />
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
        </div>
      )}
    </Dialog>
  )
}
