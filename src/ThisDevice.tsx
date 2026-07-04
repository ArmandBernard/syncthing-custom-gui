import { CircularProgress } from './components/ui/Progress.tsx'
import { useSyncthingQuery } from './hooks/useSyncthingQuery.ts'
import { Card } from './components/ui/Card.tsx'
import { TimeSpan } from './components/TimeSpan.tsx'
import { ByteSize } from './components/ByteSize.tsx'

export function ThisDevice() {
  const { data: status, isLoading: statusIsLoading } = useSyncthingQuery('GET /system/status', {
    refetchInterval: 10000,
  })
  const { data: config, isLoading: configIsLoading } = useSyncthingQuery('GET /config')
  const { data: connections, isLoading: connectionsAreLoading } = useSyncthingQuery(
    'GET /system/connections',
    { refetchInterval: 5000 },
  )

  if (
    statusIsLoading ||
    !status ||
    configIsLoading ||
    !config ||
    connectionsAreLoading ||
    !connections
  ) {
    return <CircularProgress aria-label="Loading" />
  }

  const myId = status.myID
  const myDeviceConfigInfo = config.devices.find((d) => d.deviceID === myId)!

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl">This device</h2>
      <Card>
        <div className="flex flex-col gap-4">
          <div className="text-xl">{myDeviceConfigInfo.name}</div>
          <ul>
            <li>
              Uptime: <TimeSpan seconds={status.uptime} />
            </li>
            <li>
              Download: <ByteSize bytes={connections.total.inBytesTotal} />
            </li>
            <li>
              Upload: <ByteSize bytes={connections.total.outBytesTotal} />
            </li>
          </ul>
        </div>
      </Card>
    </div>
  )
}
