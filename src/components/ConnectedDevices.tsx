import { CircularProgress } from './ui/Progress.tsx'
import { useSyncthingQuery } from '../hooks/useSyncthingQuery.ts'
import type { Connection } from '../lib/syncthing/types/system.ts'
import { Card } from './ui/Card.tsx'
import { ByteSize } from './ByteSize.tsx'
import type { ConnectionStatus } from '../lib/ConnectionStatus.ts'
import getConnectionStatus from '../lib/getConnectionStatus.ts'

export function ConnectedDevices() {
  const { data: connections, isLoading: connectionsAreLoading } = useSyncthingQuery(
    'GET /system/connections',
    { refetchInterval: 5000 },
  )
  const { data: config, isLoading: configIsLoading } = useSyncthingQuery('GET /config')

  if (connectionsAreLoading || !connections || configIsLoading || !config) {
    return <CircularProgress aria-label="Loading" />
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl">Devices</h2>
      <ul className="flex flex-col gap-2">
        {config.devices.map((device) => {
          const connection: Connection | undefined = connections.connections[device.deviceID]

          // typically happens if this connection is you
          if (!connection) {
            return null
          }

          return (
            <li key={device.deviceID}>
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
            </li>
          )
        })}
      </ul>
    </div>
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
