import { Dialog } from './ui/Dialog.tsx'
import { TextField } from './ui/TextField.tsx'
import { useState } from 'react'
import type { FolderConfiguration } from '../lib/syncthing/types/config'
import { Button } from './ui/Button.tsx'
import { useSyncthingMutation } from '../hooks/useSyncthingMutation.ts'
import { useSyncthingInvalidate } from '../hooks/useSyncthingInvalidate.ts'

export function FolderDialog({
  initialFolderConfig,
  onClose,
}: {
  initialFolderConfig: FolderConfiguration | undefined
  onClose: () => void
}) {
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
        </div>
      )}
    </Dialog>
  )
}
