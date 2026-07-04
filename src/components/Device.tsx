import { CircularProgress } from './ui/Progress.tsx'
import { useSyncthingQuery } from '../hooks/useSyncthingQuery.ts'
import type { Connection } from '../lib/syncthing/types/system.ts'
import { ByteSize } from './ByteSize.tsx'
import type { DeviceConfiguration } from '../lib/syncthing/types/config'
import type { TransferStatus } from '../lib/TransferStatus.ts'
import { getTransferStatus } from '../lib/getTransferStatus.ts'
import type { DeviceStats } from '../lib/syncthing/types/stats.ts'
import { RelativeTime } from './RelativeTime.tsx'
import { Accordion } from './ui/Accordion.tsx'
import { useState } from 'react'

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
    <div className="rounded-md bg-surface text-on-surface">
      <Accordion
        expanded={expanded}
        setExpanded={setExpanded}
        buttonBody={
          <div className="flex justify-between gap-4 p-4 bg-surface rounded-md hover:brightness-80">
            <div className="text-xl">{device.name}</div>
            <div>
              <ConnectionStatusText
                connected={connection.connected}
                transferStatus={getTransferStatus(completion)}
              />{' '}
              <div className="inline">{Math.trunc(completion.completion)}%</div>
            </div>
          </div>
        }
      >
        <div className="pb-4 px-4">
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
        </div>
      </Accordion>
    </div>
  )
}

function ConnectionStatusText({
  connected,
  transferStatus,
}: {
  connected: boolean
  transferStatus: TransferStatus
}) {
  const commonClasses = 'inline text-xl'

  if (!connected) {
    return <div className={`${commonClasses} text-on-surface-disconnected`}>Disconnected</div>
  } else {
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
}
