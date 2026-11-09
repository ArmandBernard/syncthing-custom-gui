import type { GUIConfiguration } from '@lib/syncthing/types/config'
import type { SyncthingApiError } from '@lib/syncthing/SyncthingApiError.ts'
import { ErrorAlert } from '@components/ui/ErrorAlert.tsx'
import { useSyncthingQuery } from '@hooks/useSyncthingQuery.ts'
import { RelativeTime } from '@components/RelativeTime.tsx'
import { Table } from '@components/ui/table/Table.tsx'

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
      <Table className="grid grid-cols-[7rem_1fr_2fr_8rem]">
        <thead className="contents">
          <tr className="contents">
            <th>Id</th>
            <th>Source device</th>
            <th>Name</th>
            <th>Ignored at</th>
          </tr>
        </thead>
        <tbody className="contents">
          {ignoredFolders?.map((folder) => {
            return (
              <tr key={`${folder.deviceId}:${folder.id}`} className="contents">
                <td>
                  <code>{folder.id}</code>
                </td>
                <td>{folder.deviceName}</td>
                <td>{folder.label}</td>
                <td>
                  <RelativeTime date={folder.time} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </Table>
      {error && <ErrorAlert error={error} />}
    </div>
  )
}
