import { CircularProgress } from './ui/Progress.tsx'
import { useSyncthingQuery } from '../hooks/useSyncthingQuery.ts'
import type { Connection } from '../lib/syncthing/types/system.ts'
import { Device } from './Device.tsx'

export function RemoteDevices() {
  const { data: connections, isLoading: connectionsAreLoading } = useSyncthingQuery(
    'GET /system/connections',
    { refetchInterval: 5000 },
  )
  const { data: config, isLoading: configIsLoading } = useSyncthingQuery('GET /config')
  const { data: stats, isLoading: statsAreLoading } = useSyncthingQuery('GET /stats/device', {
    refetchInterval: 30000,
  })

  if (
    connectionsAreLoading ||
    !connections ||
    configIsLoading ||
    !config ||
    statsAreLoading ||
    !stats
  ) {
    return <CircularProgress aria-label="Loading" />
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl">Remote devices</h2>
      <ul className="flex flex-col gap-2">
        {config.devices.map((device) => {
          const connection: Connection | undefined = connections.connections[device.deviceID]
          const deviceStats = stats[device.deviceID]

          // typically happens if this connection is you
          if (!connection) {
            return null
          }

          return (
            <li key={device.deviceID}>
              <Device device={device} connection={connection} stats={deviceStats} />
            </li>
          )
        })}
      </ul>
    </div>
  )
}
