import { useSyncthingQuery } from '@hooks/useSyncthingQuery.ts'
import type { Connection } from '@lib/syncthing/types/system.ts'
import { Device } from './Device.tsx'
import { CircularProgressCentred } from '@components/CircularProgressCentred.tsx'

import { useConnections } from '@context/connections/useConnections.ts'

export function RemoteDevices() {
  const { data: devices, isLoading: devicesLoading } = useSyncthingQuery('GET /config/devices')
  const { data: stats, isLoading: statsAreLoading } = useSyncthingQuery('GET /stats/device', {
    refetchInterval: 30000,
  })
  const connections = useConnections()

  if (!connections || devicesLoading || !devices || statsAreLoading || !stats) {
    return <CircularProgressCentred name="remote devices" />
  }

  const grouped = Object.groupBy(devices, (device) => device.group)

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl">Remote devices</h2>
      {Object.entries(grouped)
        .toSorted((a, b) => a[0].localeCompare(b[0]))
        .map(([group, value]) => (
          <>
            {group && <h3 className="text-xl">{group}</h3>}
            <ul className="flex flex-col gap-2">
              {value!
                .toSorted((da, db) => da.name.localeCompare(db.name))
                .map((device) => {
                  const connection: Connection | undefined =
                    connections.connections[device.deviceID]
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
          </>
        ))}
    </div>
  )
}
