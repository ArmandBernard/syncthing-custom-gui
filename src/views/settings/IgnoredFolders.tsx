import type { DeviceConfiguration, ObservedFolder } from '@lib/syncthing/types/config'
import type { SyncthingApiError } from '@lib/syncthing/SyncthingApiError.ts'
import { ErrorAlert } from '@components/ui/ErrorAlert.tsx'
import { useSyncthingQuery } from '@hooks/useSyncthingQuery.ts'
import { RelativeTime } from '@components/RelativeTime.tsx'
import { Table } from '@components/ui/table/Table.tsx'
import { IconButton } from '@components/ui/IconButton.tsx'
import { DeleteIcon } from '@components/icons/DeleteIcon.tsx'

/** Identifies one ignored folder: the same folder can be ignored by several devices. */
export interface IgnoredFolderRef {
  deviceId: string
  folderId: string
}

interface IgnoredFoldersProps {
  /** Ignored folders queued for removal. They are hidden here, and removed when the settings are saved. */
  removed: IgnoredFolderRef[]
  onRemove: (ignoredFolder: IgnoredFolderRef) => void
  error: SyncthingApiError | null
}

function getAllIgnoredFolders(devices: DeviceConfiguration[] | undefined) {
  return (
    devices?.flatMap((device) =>
      device.ignoredFolders.map((ignoredFolder) => ({
        deviceId: device.deviceID,
        deviceName: device.name,
        ...ignoredFolder,
      })),
    ) ?? []
  )
}

export function IgnoredFolders({ removed, onRemove, error }: IgnoredFoldersProps) {
  const { data: devices, error: devicesError } = useSyncthingQuery('GET /config/devices')

  const ignoredFolders = getAllIgnoredFolders(devices).filter(
    (folder) => !removed.some((r) => r.deviceId === folder.deviceId && r.folderId === folder.id),
  )

  return (
    <div className="flex flex-col gap-4">
      <Table className="grid grid-cols-[7rem_1fr_2fr_9rem_auto]">
        <thead className="contents">
          <tr className="contents">
            <th>Id</th>
            <th>Source device</th>
            <th>Name</th>
            <th className="text-right!">Ignored at</th>
            <th aria-label="actions"></th>
          </tr>
        </thead>
        <tbody className="contents">
          {ignoredFolders.map((folder) => (
            <Row key={`${folder.deviceId}:${folder.id}`} folder={folder} onRemove={onRemove} />
          ))}
        </tbody>
      </Table>
      {error && <ErrorAlert error={error ?? devicesError} />}
    </div>
  )
}

type RowProps = {
  folder: ObservedFolder & {
    deviceId: string
    deviceName: string
  }
  onRemove: (ignoredFolder: IgnoredFolderRef) => void
}

function Row({ folder, onRemove }: RowProps) {
  return (
    <tr className="contents">
      <td>
        <code>{folder.id}</code>
      </td>
      <td>{folder.deviceName}</td>
      <td>{folder.label}</td>
      <td className="justify-end">
        <RelativeTime date={folder.time} />
      </td>
      <td className="justify-end pr-0!">
        <IconButton
          aria-label="Delete"
          onClick={() => onRemove({ deviceId: folder.deviceId, folderId: folder.id })}
        >
          <DeleteIcon />
        </IconButton>
      </td>
    </tr>
  )
}
