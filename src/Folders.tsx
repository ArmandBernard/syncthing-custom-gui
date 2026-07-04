import { useSyncthingQuery } from './hooks/useSyncthingQuery.ts'
import { CircularProgress } from './components/ui/Progress.tsx'
import { CardAccordion } from './components/ui/CardAccordion.tsx'
import { useState } from 'react'
import type { DeviceConfiguration, FolderConfiguration } from './lib/syncthing/types/config'
import { TimeSpan } from './components/TimeSpan.tsx'

export function Folders() {
  const { data: config, isLoading: configLoading } = useSyncthingQuery('GET /config')

  if (configLoading || !config) {
    return <CircularProgress aria-label="Loading" />
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl">Folders</h2>
      <ul className="flex flex-col gap-2">
        {config.folders.map((folder) => (
          <li key={folder.id}>
            <Folder folder={folder} devices={config.devices} />
          </li>
        ))}
      </ul>
    </div>
  )
}

function Folder({
  folder,
  devices,
}: {
  folder: FolderConfiguration
  devices: DeviceConfiguration[]
}) {
  const [expanded, setExpanded] = useState<boolean>(false)

  return (
    <CardAccordion
      expanded={expanded}
      setExpanded={setExpanded}
      buttonBody={
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="text-xl">{folder.label}</div>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <ul>
          <li>Path: {folder.path}</li>
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
