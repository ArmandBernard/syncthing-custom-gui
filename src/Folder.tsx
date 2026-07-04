import type { DeviceConfiguration, FolderConfiguration } from './lib/syncthing/types/config'
import { useState } from 'react'
import { useSyncthingQuery } from './hooks/useSyncthingQuery.ts'
import { CardAccordion } from './components/ui/CardAccordion.tsx'
import { ByteSize } from './components/ByteSize.tsx'
import { TimeSpan } from './components/TimeSpan.tsx'
import type { FolderState } from './lib/syncthing/types/db.ts'

export function Folder({
  folder,
  devices,
}: {
  folder: FolderConfiguration
  devices: DeviceConfiguration[]
}) {
  const [expanded, setExpanded] = useState<boolean>(false)
  const { data: status } = useSyncthingQuery('GET /db/status', { query: { folder: folder.id } })

  return (
    <CardAccordion
      expanded={expanded}
      setExpanded={setExpanded}
      buttonBody={
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="text-xl">{folder.label}</div>
          </div>
          <FolderStatusText folderState={status?.state} />
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <ul>
          <li>Path: {folder.path}</li>
          {status && (
            <li>
              Contents: {status.localFiles} files, {status.localDirectories} directories,{' '}
              <ByteSize bytes={status.localBytes} />
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
      </div>
    </CardAccordion>
  )
}

function FolderStatusText({ folderState }: { folderState: FolderState | undefined }) {
  const commonClasses = 'inline text-xl'

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
