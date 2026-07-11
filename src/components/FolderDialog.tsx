import { Dialog } from './ui/Dialog.tsx'
import { TextField } from './ui/TextField.tsx'
import { useState } from 'react'
import type { FolderConfiguration } from '@lib/syncthing/types/config'
import { Button } from './ui/Button.tsx'
import { useSyncthingMutation } from '@hooks/useSyncthingMutation.ts'
import { useSyncthingInvalidate } from '@hooks/useSyncthingInvalidate.ts'
import { useSyncthingQuery } from '@hooks/useSyncthingQuery.ts'
import { useCreateFolderId } from '@hooks/useCreateFolderId.ts'
import { mergeConfigurations } from '@lib/mergeConfigurations.ts'

export default function FolderDialog({
  initialFolderConfig,
  isOpen,
  onClose,
}: {
  initialFolderConfig: FolderConfiguration | undefined
  isOpen: boolean
  onClose: () => void
}) {
  const [folderConfigChanges, setFolderConfigChanges] = useState<Partial<FolderConfiguration>>({})
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const { data: status } = useSyncthingQuery('GET /system/status')
  const newFolderId = useCreateFolderId()
  const { data: defaultFolderConfig } = useSyncthingQuery('GET /config/defaults/folder')
  const { mutateAsync: updateFolderAsync, isPending: updateFolderIsPending } = useSyncthingMutation(
    'PATCH /config/folders/:id',
  )
  const { mutateAsync: deleteFolderAsync, isPending: deleteFolderIsPending } = useSyncthingMutation(
    'DELETE /config/folders/:id',
  )
  const { mutateAsync: createFolderAsync, isPending: createFolderIsPending } =
    useSyncthingMutation('POST /config/folders')
  const invalidateFolders = useSyncthingInvalidate('GET /config/folders')

  const isPending = updateFolderIsPending || createFolderIsPending || deleteFolderIsPending
  const inEditMode = !!initialFolderConfig
  const effectiveConfig: FolderConfiguration | undefined = mergeConfigurations(
    defaultFolderConfig,
    newFolderId ? { id: newFolderId } : undefined,
    initialFolderConfig,
    folderConfigChanges,
  )

  function handleClickDelete() {
    setConfirmingDelete(true)
  }
  function handleCancelConfirmDelete() {
    setConfirmingDelete(false)
  }
  async function handleConfirmDelete() {
    if (initialFolderConfig) {
      await deleteFolderAsync({ params: { id: initialFolderConfig.id } })
      await invalidateFolders()
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
        params: { id: effectiveConfig.id },
        body: effectiveConfig,
      })
    } else if (newFolderId) {
      await createFolderAsync({
        body: { ...effectiveConfig, id: newFolderId },
      })
    }
    await invalidateFolders()
    onClose()
  }

  function handleUpdateField(configUpdates: Partial<FolderConfiguration>) {
    setFolderConfigChanges((old) => {
      return { ...old, ...configUpdates }
    })
  }

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title={
        <>
          {inEditMode ? 'Edit' : 'Create'} folder{' '}
          <span className="text-on-surface-variant">{!inEditMode ? ` (${newFolderId})` : ''}</span>
        </>
      }
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
          <TextField
            label="Label"
            value={effectiveConfig.label}
            onChange={(e) => handleUpdateField({ label: e.currentTarget?.value })}
            supportingText="Optional descriptive label for the folder."
          />
          <TextField
            label="Group"
            value={effectiveConfig.group}
            onChange={(e) => handleUpdateField({ group: e.currentTarget?.value })}
            supportingText="Optional group for the folder."
          />
          <TextField
            label="Path"
            value={effectiveConfig.path}
            onChange={(e) => handleUpdateField({ path: e.currentTarget?.value })}
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
