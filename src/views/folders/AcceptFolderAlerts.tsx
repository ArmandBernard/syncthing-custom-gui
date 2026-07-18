import type { DeviceID, FolderID } from '@lib/syncthing/types/common.ts'
import type { PendingFolder } from '@lib/syncthing/types/cluster.ts'
import type { DeviceConfiguration, FolderConfiguration } from '@lib/syncthing/types/config'
import { getEnumEntries } from '@lib/getEnumEntries.ts'
import { RelativeTime } from '@components/RelativeTime.tsx'
import { useSyncthingQuery } from '@hooks/useSyncthingQuery.ts'
import { Button } from '@components/ui/Button.tsx'
import { useSyncthingMutation } from '@hooks/useSyncthingMutation.ts'
import { useSyncthingInvalidate } from '@hooks/useSyncthingInvalidate.ts'
import FolderDialog from './FolderDialog.tsx'
import { useState } from 'preact/compat'
import { getEnumKeys } from '@lib/getEnumKeys.ts'

export function AcceptFolderAlerts({ devices }: { devices: DeviceConfiguration[] }) {
  const { data: pendingFolders } = useSyncthingQuery('GET /cluster/pending/folders')
  const { data: defaultFolderConfig } = useSyncthingQuery('GET /config/defaults/folder')
  const { mutateAsync: removeOffer } = useSyncthingMutation('DELETE /cluster/pending/folders')
  const invalidate = useSyncthingInvalidate('GET /cluster/pending/folders')
  const [editingFolderId, setEditingFolderId] = useState<FolderID | undefined>(undefined)

  const deviceDictionary = new Map<DeviceID, DeviceConfiguration>(
    devices.map((d) => [d.deviceID, d]),
  )

  if (!pendingFolders) {
    return null
  }

  function handleEditClick(folderID: FolderID) {
    setEditingFolderId(folderID)
  }

  function handleEditDialogCloseClick() {
    setEditingFolderId(undefined)
  }

  async function handleSaveClick() {
    if (editingFolderId) {
      await removeOffer({ query: { folder: editingFolderId } })
      await invalidate()
    }
  }

  const editingPendingFolder = editingFolderId ? pendingFolders[editingFolderId] : undefined
  const initialFolderConfig: FolderConfiguration | undefined =
    editingFolderId && editingPendingFolder && defaultFolderConfig
      ? {
          ...defaultFolderConfig,
          id: editingFolderId,
          label: Object.values(editingPendingFolder.offeredBy)[0].label,
          devices: getEnumKeys(editingPendingFolder.offeredBy).map((deviceID) => ({
            deviceID: deviceID,
            introducedBy: '',
            encryptionPassword: '',
          })),
        }
      : undefined

  return (
    <div className="flex flex-col gap-4">
      {getEnumEntries(pendingFolders).map(([folderID, folder]) => (
        <AcceptFolderAlert
          key={folderID}
          folderID={folderID}
          folder={folder}
          deviceDictionary={deviceDictionary}
          onEditClick={handleEditClick}
        />
      ))}
      <FolderDialog
        initialConfig={initialFolderConfig}
        isOpen={!!editingFolderId}
        editing={false}
        onClose={handleEditDialogCloseClick}
        onSave={handleSaveClick}
      />
    </div>
  )
}

function AcceptFolderAlert({
  folderID,
  folder,
  deviceDictionary,
  onEditClick,
}: {
  folderID: FolderID
  folder: PendingFolder
  deviceDictionary: Map<DeviceID, DeviceConfiguration>
  onEditClick: (folderId: FolderID) => void
}) {
  const { mutateAsync: removeOffer, isPending: removeOfferIsPending } = useSyncthingMutation(
    'DELETE /cluster/pending/folders',
  )
  const invalidate = useSyncthingInvalidate('GET /cluster/pending/folders')
  const offers = getEnumEntries(folder.offeredBy)
  const offerPair1 = offers[0]
  const [offer1Device, offer1Offer] = offerPair1

  async function handleOnRemoveClick() {
    await removeOffer({ query: { folder: folderID } })
    await invalidate()
  }

  function handleOnAddClick() {
    onEditClick(folderID)
  }

  return (
    <div
      role="alert"
      className="flex flex-col gap-4 bg-primary-container text-on-primary-container rounded-md p-4"
    >
      <div className="flex justify-between items-baseline gap-4 text-lg">
        <div>New folder</div>
        <div>
          Shared <RelativeTime date={offer1Offer.time} />
        </div>
      </div>
      <div className="text-sm">
        {deviceDictionary.get(offer1Device)?.name} wants to share folder "{offer1Offer.label}" (
        {folderID})
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="filled" onClick={handleOnAddClick}>
          Add
        </Button>
        <Button variant="tonal" disabled={removeOfferIsPending} onClick={handleOnRemoveClick}>
          Dismiss
        </Button>
      </div>
    </div>
  )
}
