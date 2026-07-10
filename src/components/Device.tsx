import { CircularProgress } from './ui/Progress.tsx'
import { useSyncthingQuery } from '../hooks/useSyncthingQuery.ts'
import type { Connection } from '../lib/syncthing/types/system.ts'
import type { DeviceConfiguration } from '../lib/syncthing/types/config'
import { getTransferStatus } from '../lib/getTransferStatus.ts'
import type { DeviceStats } from '../lib/syncthing/types/stats.ts'
import { RelativeTime } from './RelativeTime.tsx'
import { useState } from 'react'
import { CardAccordion } from './ui/CardAccordion.tsx'
import { Identicon } from './ui/Identicon.tsx'
import { Button } from './ui/Button.tsx'
import { useSyncthingMutation } from '../hooks/useSyncthingMutation.ts'
import { useSyncthingInvalidate } from '../hooks/useSyncthingInvalidate.ts'
import type { TransferHistoryPoint } from '../hooks/useDeviceTransferHistory.ts'
import { TransferChart } from './TransferChart.tsx'
import { formatBytes } from '../lib/formatBytes.ts'
import { formatTransferRate } from '../lib/formatTransferRate.ts'
import { SpeedInline } from './SpeedInline.tsx'
import type { Completion } from '../lib/syncthing/types/db.ts'

export function Device({
  connection,
  device,
  stats,
  transferHistory,
}: {
  connection: Connection
  device: DeviceConfiguration
  stats: DeviceStats
  transferHistory: TransferHistoryPoint[]
}) {
  const [expanded, setExpanded] = useState(false)
  const { data: completion, isLoading: completionIsLoading } = useSyncthingQuery(
    'GET /db/completion',
    { query: { device: device.deviceID }, refetchInterval: 5000 },
  )
  const { mutateAsync: pauseAsync } = useSyncthingMutation('POST /system/pause', {
    query: { device: device.deviceID },
  })
  const { mutateAsync: resumeAsync } = useSyncthingMutation('POST /system/resume', {
    query: { device: device.deviceID },
  })
  const invalidateConnections = useSyncthingInvalidate('GET /system/connections')

  if (completionIsLoading || !completion) {
    return <CircularProgress aria-label="Loading" />
  }

  async function handlePauseOrResume() {
    if (connection.paused) {
      await resumeAsync()
    } else {
      await pauseAsync()
    }
    // It can take a little time to unpause
    setTimeout(async () => await invalidateConnections(), 200)
  }

  const latestRates = transferHistory.slice(-1).at(0)

  return (
    <CardAccordion
      expanded={expanded}
      setExpanded={setExpanded}
      buttonBody={
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Identicon id={device.deviceID} />
            <div className="text-xl">{device.name}</div>
          </div>
          <div className="flex items-baseline gap-2">
            <SpeedInline rates={latestRates} />
            <ConnectionStatusText connection={connection} completion={completion} />
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <ul>
          {!connection.connected && (
            <li>
              Last seen: <RelativeTime date={stats.lastSeen} />
            </li>
          )}
          <li>
            Upload: {latestRates && <>{formatTransferRate(latestRates?.outRate)} </>}(
            {formatBytes(connection.outBytesTotal)} total)
          </li>
          <li>
            Download: {latestRates && <>{formatTransferRate(latestRates?.inRate)} </>}(
            {formatBytes(connection.inBytesTotal)} total)
          </li>
        </ul>
        <TransferChart history={transferHistory} />
        <div className="flex gap-4 justify-end">
          <Button variant="outlined" onClick={handlePauseOrResume}>
            {connection.paused ? 'Resume' : 'Pause'}
          </Button>
        </div>
      </div>
    </CardAccordion>
  )
}

function ConnectionStatusText({
  connection,
  completion,
}: {
  connection: Connection
  completion: Completion
}) {
  const transferStatus = getTransferStatus(completion)

  const commonClasses = 'inline text-xl'

  if (connection.paused) {
    return <div className={`${commonClasses} text-on-surface-paused`}>Paused</div>
  }

  if (!connection.connected) {
    return <div className={`${commonClasses} text-on-surface-disconnected`}>Disconnected</div>
  }

  const progressText =
    completion.completion === 100 ? '' : ` (${Math.trunc(completion.completion)}%)`

  switch (transferStatus) {
    case 'up-to-date':
      return <div className={`${commonClasses} text-on-surface-connected`}>Up-to-date</div>
    case 'paused':
      return <div className={`${commonClasses} text-on-surface-paused`}>Paused{progressText}</div>
    case 'syncing':
      return <div className={`${commonClasses} text-on-surface-syncing`}>Syncing{progressText}</div>
    default:
      return <div className={`${commonClasses} text-on-surface-variant`}>Unknown status</div>
  }
}
