import type { DeviceConfiguration, FolderConfiguration } from '@lib/syncthing/types/config'
import { useState } from 'react'
import { useSyncthingQuery } from '@hooks/useSyncthingQuery.ts'
import { CardAccordion } from '@components/ui/CardAccordion.tsx'
import { TimeSpan } from '@components/TimeSpan.tsx'
import type { FolderState } from '@lib/syncthing/types/db.ts'
import { formatBytes } from '@lib/formatBytes.ts'
import { Button } from '@components/ui/Button.tsx'
import { useSyncthingMutation } from '@hooks/useSyncthingMutation.ts'
import { useSyncthingInvalidate } from '@hooks/useSyncthingInvalidate.ts'

export function Folder({
  folder,
  devices,
  onEditClick,
}: {
  folder: FolderConfiguration
  devices: DeviceConfiguration[]
  onEditClick: () => void
}) {
  const [expanded, setExpanded] = useState<boolean>(false)

  const { data: status } = useSyncthingQuery('GET /db/status', { query: { folder: folder.id } })
  const { mutateAsync: scanAsync, isPending: scanAsyncIsPending } =
    useSyncthingMutation('POST /db/scan')
  const invalidate = useSyncthingInvalidate('GET /db/status')

  function handleEditClick() {
    onEditClick()
  }

  async function handleRescanClick() {
    await scanAsync({ query: { folder: folder.id } })
    await invalidate()
  }

  return (
    <CardAccordion
      expanded={expanded}
      setExpanded={setExpanded}
      buttonBody={
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="text-xl">{folder.label}</div>
          </div>
          <FolderStatusText folder={folder} folderState={status?.state} />
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <ul>
          <li>Path: {folder.path}</li>
          {status && (
            <li>
              Contents: {status.localFiles} files, {status.localDirectories} directories,{' '}
              {formatBytes(status.localBytes)}
            </li>
          )}
          <li>
            Rescan: <TimeSpan seconds={folder.rescanIntervalS} />{' '}
            {folder.fsWatcherEnabled ? '(enabled)' : '(disabled)'}
          </li>
          <li>
            Devices:{' '}
            {folder.devices
              .map((device) => {
                const deviceConfig = devices.find((d) => d.deviceID === device.deviceID)

                return deviceConfig?.name
              })
              .join(', ')}
          </li>
        </ul>
        <div className="flex gap-4 justify-end">
          <Button
            variant="outlined"
            disabled={status?.state === 'scanning' || scanAsyncIsPending}
            onClick={handleRescanClick}
          >
            Rescan
          </Button>
          <Button variant="outlined" onClick={handleEditClick}>
            Edit
          </Button>
        </div>
      </div>
    </CardAccordion>
  )
}

function FolderStatusText({
  folderState,
  folder,
}: {
  folderState: FolderState | undefined
  folder: FolderConfiguration
}) {
  const commonClasses = 'inline text-xl'

  if (folder.paused) {
    return <div className={`${commonClasses} text-on-surface-paused`}>Paused</div>
  }

  switch (folderState) {
    case 'idle':
      return <div className={`${commonClasses} text-on-surface-connected`}>Idle</div>
    case 'error':
      return <div className={`${commonClasses} text-on-surface-disconnected`}>Errored</div>
    case 'scanning':
      return <div className={`${commonClasses} text-on-surface-syncing`}>Scanning</div>
    case 'syncing':
      return <div className={`${commonClasses} text-on-surface-syncing`}>Syncing</div>
    default:
      return <div className={`${commonClasses} text-on-surface-variant`}>Unknown status</div>
  }
}
