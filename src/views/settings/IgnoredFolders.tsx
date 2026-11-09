import type {
  DeviceConfiguration,
  GUIConfiguration,
  ObservedFolder,
} from '@lib/syncthing/types/config'
import type { SyncthingApiError } from '@lib/syncthing/SyncthingApiError.ts'
import { ErrorAlert } from '@components/ui/ErrorAlert.tsx'
import { useSyncthingQuery } from '@hooks/useSyncthingQuery.ts'
import { RelativeTime } from '@components/RelativeTime.tsx'
import { Table } from '@components/ui/table/Table.tsx'
import { IconButton } from '@components/ui/IconButton.tsx'
import { DeleteIcon } from '@components/icons/DeleteIcon.tsx'
import { useSyncthingMutation } from '@hooks/useSyncthingMutation.ts'

interface IgnoredFoldersProps {
  guiConfig: GUIConfiguration | undefined
  error: SyncthingApiError | null
}

export function IgnoredFolders({ error }: IgnoredFoldersProps) {
  const { data: devices } = useSyncthingQuery('GET /config/devices')

  const ignoredFolders = devices?.flatMap((device) =>
    device.ignoredFolders.map((ignoredFolder) => ({
      deviceId: device.deviceID,
      deviceName: device.name,
      ...ignoredFolder,
    })),
  )

  return (
    <div className="flex flex-col gap-4">
      <Table className="grid grid-cols-[7rem_1fr_2fr_8rem_auto]">
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
          {ignoredFolders?.map((folder) => (
            <Row key={`${folder.deviceId}:${folder.id}`} folder={folder} devices={devices} />
          ))}
        </tbody>
      </Table>
      {error && <ErrorAlert error={error} />}
    </div>
  )
}

type RowRrops = {
  folder: ObservedFolder & {
    deviceId: string
    deviceName: string
  }
  devices: DeviceConfiguration[] | undefined
}

function Row({ folder, devices }: RowRrops) {
  const { mutateAsync: patchDevice, isPending } = useSyncthingMutation('PATCH /config/devices/:id')

  async function removeIgnoredFolder(deviceID: string, folderID: string) {
    const device = devices?.find((d) => d.deviceID === deviceID)
    if (!device) return

    await patchDevice({
      params: { id: deviceID },
      body: {
        ignoredFolders: device.ignoredFolders.filter((f) => f.id !== folderID),
      },
    })
  }

  return (
    <tr key={`${folder.deviceId}:${folder.id}`} className="contents">
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
          onClick={() => removeIgnoredFolder(folder.deviceId, folder.id)}
          disabled={isPending}
        >
          <DeleteIcon fill="var(--color-error)" />
        </IconButton>
      </td>
    </tr>
  )
}
