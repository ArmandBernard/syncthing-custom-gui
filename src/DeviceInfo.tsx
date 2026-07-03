import { CircularProgress } from './components/ui/Progress.tsx'
import { useSyncthingQuery } from './hooks/useSyncthingQuery.ts'
import { Card } from './components/ui/Card.tsx'
import { TimeSpan } from './components/TimeSpan.tsx'

export function DeviceInfo() {
  const { data: status, isLoading: statusIsLoading } = useSyncthingQuery('GET /system/status', {
    refetchInterval: 10000,
  })
  const { data: config, isLoading: configIsLoading } = useSyncthingQuery('GET /config')

  if (statusIsLoading || !status || configIsLoading || !config) {
    return <CircularProgress aria-label="Loading" />
  }

  const myId = status.myID
  const myDeviceConfigInfo = config.devices.find((d) => d.deviceID === myId)!

  return (
    <Card className="flex flex-col gap-4">
      <h2 className="text-xl">Device info</h2>
      <ul>
        <li>Name: {myDeviceConfigInfo.name}</li>
        <li>
          Uptime: <TimeSpan seconds={status.uptime} />
        </li>
      </ul>
    </Card>
  )
}
