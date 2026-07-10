import { CircularProgress } from './ui/Progress.tsx'
import { useSyncthingQuery } from '../hooks/useSyncthingQuery.ts'
import type { Connection } from '../lib/syncthing/types/system.ts'
import { ByteSize } from './ByteSize.tsx'
import type { DeviceConfiguration } from '../lib/syncthing/types/config'
import type { TransferStatus } from '../lib/TransferStatus.ts'
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
          <div>
            <ConnectionStatusText
              connection={connection}
              transferStatus={getTransferStatus(completion)}
            />{' '}
            <div className="inline">{Math.trunc(completion.completion)}%</div>
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
            Upload: <ByteSize bytes={connection.outBytesTotal} />
          </li>
          <li>
            Download: <ByteSize bytes={connection.inBytesTotal} />
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
  transferStatus,
}: {
  connection: Connection
  transferStatus: TransferStatus
}) {
  const commonClasses = 'inline text-xl'

  if (connection.paused) {
    return <div className={`${commonClasses} text-on-surface-paused`}>Paused</div>
  }

  if (!connection.connected) {
    return <div className={`${commonClasses} text-on-surface-disconnected`}>Disconnected</div>
  }

  switch (transferStatus) {
    case 'up-to-date':
      return <div className={`${commonClasses} text-on-surface-connected`}>Up-to-date</div>
    case 'paused':
      return <div className={`${commonClasses} text-on-surface-paused`}>Paused</div>
    case 'syncing':
      return <div className={`${commonClasses} text-on-surface-syncing`}>Syncing</div>
    default:
      return <div className={`${commonClasses} text-on-surface-variant`}>Unknown status</div>
  }
}
