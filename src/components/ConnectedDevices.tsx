import { CircularProgress } from './ui/Progress.tsx'
import { useSyncthingQuery } from '../hooks/useSyncthingQuery.ts'
import type { Connection } from '../lib/syncthing/types/system.ts'
import { Card } from './ui/Card.tsx'
import { ByteSize } from './ByteSize.tsx'

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
                <div>
                  {device.name} <ConnectionStatus connection={connection} />
                </div>
                <ul>
                  <li>
                    Upload: <ByteSize bytes={connection.outBytesTotal} />
                  </li>
                  <li>
                    Download: <ByteSize bytes={connection.inBytesTotal} />
                  </li>
                </ul>
              </Card>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function ConnectionStatus({ connection }: { connection: Connection }) {
  if (!connection.connected) {
    return <div className="text-error">Disconnected</div>
  }
  if (connection.paused) {
    return <div className="text-amber-400">Paused</div>
  }
  if (connection.connected) {
    return <div className="text-success">Connected</div>
  }
}
