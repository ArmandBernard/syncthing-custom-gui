import { useSyncthingQuery } from '@hooks/useSyncthingQuery.ts'
import { Folder } from './Folder.tsx'
import { CircularProgressCentred } from '@components/CircularProgressCentred.tsx'
import { useState } from 'preact/compat'
import type { FolderID } from '@lib/syncthing/types/common.ts'
import { lazy, Suspense } from 'react'
import { IconButton } from '@components/ui/IconButton.tsx'
import { MoreVertIcon } from '@components/icons/MoreVertIcon.tsx'
import { Menu } from '@components/ui/menu/Menu.tsx'

const FolderDialog = lazy(() => import('./FolderDialog.tsx'))

export function Folders() {
  const [editingFolderId, setEditingFolderId] = useState<FolderID | undefined>(undefined)
  const [creatingFolder, setCreatingFolder] = useState<boolean>(false)
  const { data: folders, isLoading: foldersLoading } = useSyncthingQuery('GET /config/folders')
  const { data: devices, isLoading: devicesLoading } = useSyncthingQuery('GET /config/devices')

  if (foldersLoading || !folders || devicesLoading || !devices) {
    return <CircularProgressCentred name="folders" />
  }

  function handleEditClick(folderID: FolderID) {
    setEditingFolderId(folderID)
  }
  function handleAddClick() {
    setCreatingFolder(true)
  }
  function handleEditClose() {
    setEditingFolderId(undefined)
  }
  function handleCreateClose() {
    setCreatingFolder(false)
  }

  const grouped = Object.groupBy(folders, (folder) => folder.group)
  const editingFolder = folders.find((f) => f.id === editingFolderId)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center gap-4">
        <h2 className="text-2xl">Folders</h2>
        <Menu
          button={
            <IconButton aria-label="Folder actions">
              <MoreVertIcon />
            </IconButton>
          }
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Menu.Item onSelect={handleAddClick}>Add folder</Menu.Item>
        </Menu>
      </div>
      {Object.entries(grouped)
        .toSorted((a, b) => a[0].localeCompare(b[0]))
        .map(([group, value]) => (
          <>
            {group && <h3 className="text-xl">{group}</h3>}
            <ul className="flex flex-col gap-2">
              {value!.map((folder) => (
                <li key={folder.id}>
                  <Folder
                    folder={folder}
                    devices={devices}
                    onEditClick={() => handleEditClick(folder.id)}
                  />
                </li>
              ))}
            </ul>
          </>
        ))}
      <Suspense fallback={null}>
        <FolderDialog
          isOpen={!!editingFolder}
          key={editingFolderId}
          initialConfig={editingFolder}
          onClose={handleEditClose}
        />
        <FolderDialog
          isOpen={creatingFolder}
          initialConfig={undefined}
          onClose={handleCreateClose}
        />
      </Suspense>
    </div>
  )
}
