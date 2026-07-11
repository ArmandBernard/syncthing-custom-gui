import { useSyncthingQuery } from './hooks/useSyncthingQuery.ts'
import { Folder } from './components/Folder.tsx'
import { CircularProgressCentred } from './components/CircularProgressCentred.tsx'
import { useState } from 'preact/compat'
import type { FolderID } from './lib/syncthing/types/common.ts'
import { lazy, Suspense } from 'react'

const FolderDialog = lazy(() => import('./components/FolderDialog.tsx'))

export function Folders() {
  const [editingFolderId, setEditingFolderId] = useState<FolderID | undefined>(undefined)
  const { data: folders, isLoading: foldersLoading } = useSyncthingQuery('GET /config/folders')
  const { data: devices, isLoading: devicesLoading } = useSyncthingQuery('GET /config/devices')

  if (foldersLoading || !folders || devicesLoading || !devices) {
    return <CircularProgressCentred name="folders" />
  }

  function handleEditClick(folderID: FolderID) {
    setEditingFolderId(folderID)
  }

  function handleClose() {
    setEditingFolderId(undefined)
  }

  const grouped = Object.groupBy(folders, (folder) => folder.group)
  const editingFolder = folders.find((f) => f.id === editingFolderId)

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl">Folders</h2>
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
          key={editingFolderId}
          initialFolderConfig={editingFolder}
          onClose={handleClose}
        />
      </Suspense>
    </div>
  )
}
