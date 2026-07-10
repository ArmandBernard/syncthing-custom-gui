import { useSyncthingQuery } from './hooks/useSyncthingQuery.ts'
import { TimeSpan } from './components/TimeSpan.tsx'
import { CardAccordion } from './components/ui/CardAccordion.tsx'
import { useState } from 'react'
import { Identicon } from './components/ui/Identicon.tsx'
import { CircularProgressCentred } from './components/CircularProgressCentred.tsx'
import { formatBytes } from './lib/formatBytes.ts'
import { formatTransferRate } from './lib/formatTransferRate.ts'
import { useDeviceTransferHistory } from './hooks/useDeviceTransferHistory.ts'
import { useConnections } from './hooks/useConnections.ts'

import { useDeviceID } from './hooks/useDeviceID.ts'

export function ThisDevice() {
  const [expanded, setExpanded] = useState(false)
  const connections = useConnections()
  const myId = useDeviceID()
  const transferHistory = useDeviceTransferHistory(myId)
  const { data: status, isLoading: statusIsLoading } = useSyncthingQuery('GET /system/status', {
    refetchInterval: 10000,
  })
  const { data: config, isLoading: configIsLoading } = useSyncthingQuery('GET /config')

  if (statusIsLoading || !status || configIsLoading || !config || !connections) {
    return <CircularProgressCentred name="device information" />
  }

  const myDeviceConfigInfo = config.devices.find((d) => d.deviceID === myId)!
  const latestRates = transferHistory?.slice(-1).at(0)

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl">This device</h2>
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
              Upload: {latestRates && <>{formatTransferRate(latestRates?.outRate)} </>}(
              {formatBytes(connections.total.outBytesTotal)} total)
            </li>
            <li>
              Download: {latestRates && <>{formatTransferRate(latestRates?.inRate)} </>}(
              {formatBytes(connections.total.inBytesTotal)} total)
            </li>
          </ul>
        </div>
      </CardAccordion>
    </div>
  )
}
