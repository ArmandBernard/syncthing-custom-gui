import { Dialog } from './ui/Dialog.tsx'
import { TextField } from './ui/TextField.tsx'
import { useState } from 'react'
import type { FolderConfiguration } from '../lib/syncthing/types/config'
import { Button } from './ui/Button.tsx'

export function FolderDialog({
  folder,
  onClose,
}: {
  folder: FolderConfiguration | undefined
  onClose: () => void
}) {
  const [name, setName] = useState<string | undefined>(folder?.label)

  function handleSave() {
    onClose()
  }

  return (
    <Dialog
      open={!!folder?.id}
      onClose={onClose}
      title="Edit folder"
      actions={
        <Button variant="outlined" onClick={handleSave}>
          Save
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <TextField label="Label" value={name} onChange={(e) => setName(e.currentTarget?.value)} />
      </div>
    </Dialog>
  )
}
