import { CircularProgress } from './components/ui/Progress.tsx'
import { useSyncthingQuery } from './hooks/useSyncthingQuery.ts'
import { TimeSpan } from './components/TimeSpan.tsx'
import { ByteSize } from './components/ByteSize.tsx'
import { CardAccordion } from './components/ui/CardAccordion.tsx'
import { useState } from 'react'
import { Identicon } from './components/ui/Identicon.tsx'

export function ThisDevice() {
  const [expanded, setExpanded] = useState(false)
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
    <CardAccordion
      expanded={expanded}
      setExpanded={setExpanded}
      buttonBody={
        <div className="flex items-center gap-4">
          <Identicon id={myDeviceConfigInfo.deviceID} />
          <div className="text-xl">{myDeviceConfigInfo.name}</div>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
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
    </CardAccordion>
  )
}
