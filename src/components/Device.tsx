import { CircularProgress } from './ui/Progress.tsx'
import { useSyncthingQuery } from '../hooks/useSyncthingQuery.ts'
import type { Connection } from '../lib/syncthing/types/system.ts'
import { Card } from './ui/Card.tsx'
import { ByteSize } from './ByteSize.tsx'
import type { ConnectionStatus } from '../lib/ConnectionStatus.ts'
import getConnectionStatus from '../lib/getConnectionStatus.ts'
import type { DeviceConfiguration } from '../lib/syncthing/types/config'

export function Device({
  connection,
  device,
}: {
  connection: Connection
  device: DeviceConfiguration
}) {
  const { data: config, isLoading: configIsLoading } = useSyncthingQuery('GET /config')

  if (configIsLoading || !config) {
    return <CircularProgress aria-label="Loading" />
  }

  return (
    <Card>
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-2">
          <div className="text-xl">{device.name}</div>
          <div>
            <ConnectionStatusText connectionStatus={getConnectionStatus(connection)} />
          </div>
        </div>
        <ul>
          <li>
            Upload: <ByteSize bytes={connection.outBytesTotal} />
          </li>
          <li>
            Download: <ByteSize bytes={connection.inBytesTotal} />
          </li>
        </ul>
      </div>
    </Card>
  )
}

function ConnectionStatusText({ connectionStatus }: { connectionStatus: ConnectionStatus }) {
  const commonClasses = 'inline text-xl'

  switch (connectionStatus) {
    case 'connected':
      return <div className={`${commonClasses} text-success`}>Connected</div>
    case 'disconnected':
      return <div className={`${commonClasses} text-error`}>Disconnected</div>
    case 'paused':
      return <div className={`${commonClasses} text-amber-400`}>Paused</div>
    default:
      return <div className={`${commonClasses} text-gray-400`}>Unknown status</div>
  }
}
