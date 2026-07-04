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

export function Device({
  connection,
  device,
  stats,
}: {
  connection: Connection
  device: DeviceConfiguration
  stats: DeviceStats
}) {
  const [expanded, setExpanded] = useState(false)
  const { data: completion, isLoading: completionIsLoading } = useSyncthingQuery(
    'GET /db/completion',
    { query: { device: device.deviceID } },
  )

  if (completionIsLoading || !completion) {
    return <CircularProgress aria-label="Loading" />
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
      return <div className={`${commonClasses} text-gray-400`}>Unknown status</div>
  }
}
