import type { DeviceID, FolderID } from '@lib/syncthing/types/common.ts'
import type { PendingFolder } from '@lib/syncthing/types/cluster.ts'
import type { DeviceConfiguration } from '@lib/syncthing/types/config'
import { getEnumEntries } from '@lib/getEnumEntries.ts'
import { RelativeTime } from '@components/RelativeTime.tsx'
import { useSyncthingQuery } from '@hooks/useSyncthingQuery.ts'

export function AcceptFolderAlerts({ devices }: { devices: DeviceConfiguration[] }) {
  const { data: pendingFolders } = useSyncthingQuery('GET /cluster/pending/folders')

  const deviceDictionary = new Map<DeviceID, DeviceConfiguration>(
    devices.map((d) => [d.deviceID, d]),
  )

  if (!pendingFolders) {
    return null
  }

  return (
    <div className="flex flex-col gap-4">
      {getEnumEntries(pendingFolders).map(([folderID, folder]) => (
        <AcceptFolderAlert
          key={folderID}
          folderID={folderID}
          folder={folder}
          deviceDictionary={deviceDictionary}
        />
      ))}
    </div>
  )
}

function AcceptFolderAlert({
  folderID,
  folder,
  deviceDictionary,
}: {
  folderID: FolderID
  folder: PendingFolder
  deviceDictionary: Map<DeviceID, DeviceConfiguration>
}) {
  const offers = getEnumEntries(folder.offeredBy)

  const offerPair1 = offers[0]
  const [offer1Device, offer1Offer] = offerPair1

  return (
    <div
      role="alert"
      className="flex flex-col gap-4 bg-primary-container text-on-primary rounded-md p-4"
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
    </div>
  )
}
