import { Dialog } from './ui/Dialog.tsx'
import { TextField } from './ui/TextField.tsx'
import { useState } from 'react'
import type { FolderConfiguration } from '../lib/syncthing/types/config'
import { Button } from './ui/Button.tsx'
import { useSyncthingMutation } from '../hooks/useSyncthingMutation.ts'
import { useSyncthingInvalidate } from '../hooks/useSyncthingInvalidate.ts'
import { useSyncthingQuery } from '../hooks/useSyncthingQuery.ts'

export function FolderDialog({
  initialFolderConfig,
  onClose,
}: {
  initialFolderConfig: FolderConfiguration | undefined
  onClose: () => void
}) {
  const { data: status } = useSyncthingQuery('GET /system/status')
  const [folderConfig, setFolderConfig] = useState<FolderConfiguration | undefined>(
    initialFolderConfig,
  )
  const { mutateAsync, isPending } = useSyncthingMutation('PATCH /config/folders/:id')
  const invalidateFolders = useSyncthingInvalidate('GET /config/folders')

  async function handleSave() {
    if (!initialFolderConfig) {
      return
    }
    await mutateAsync({
      params: { id: initialFolderConfig.id },
      body: folderConfig,
    })
    await invalidateFolders()
    onClose()
  }

  function updateFolder(folder: Partial<FolderConfiguration>) {
    setFolderConfig((old) => {
      if (!old) {
        return old
      }

      return { ...old, ...folder }
    })
  }

  return (
    <Dialog
      open={!!initialFolderConfig}
      onClose={onClose}
      title="Edit folder"
      actions={
        <Button variant="outlined" disabled={isPending} onClick={handleSave}>
          Save
        </Button>
      }
    >
      {folderConfig && (
        <div className="flex flex-col gap-4">
          <TextField
            label="Label"
            value={folderConfig.label}
            onChange={(e) => updateFolder({ label: e.currentTarget?.value })}
            supportingText="Optional descriptive label for the folder."
          />
          <TextField
            label="Group"
            value={folderConfig.group}
            onChange={(e) => updateFolder({ group: e.currentTarget?.value })}
            supportingText="Optional group for the folder."
          />
          <TextField
            label="Path"
            value={folderConfig.path}
            onChange={(e) => updateFolder({ path: e.currentTarget?.value })}
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
      )}
    </Dialog>
  )
}
