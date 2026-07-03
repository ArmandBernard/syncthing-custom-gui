import { CircularProgress } from './ui/Progress.tsx'
import { useSyncthingQuery } from '../hooks/useSyncthingQuery.ts'
import type { Connection } from '../lib/syncthing/types/system.ts'
import { Card } from './ui/Card.tsx'
import { ByteSize } from './ByteSize.tsx'
import type { DeviceConfiguration } from '../lib/syncthing/types/config'
import type { TransferStatus } from '../lib/TransferStatus.ts'
import { getTransferStatus } from '../lib/getTransferStatus.ts'

export function Device({
  connection,
  device,
}: {
  connection: Connection
  device: DeviceConfiguration
}) {
  const { data: config, isLoading: configIsLoading } = useSyncthingQuery('GET /config')
  const { data: completion, isLoading: completionIsLoading } = useSyncthingQuery(
    'GET /db/completion',
    { query: { device: device.deviceID } },
  )

  if (configIsLoading || !config || completionIsLoading || !completion) {
    return <CircularProgress aria-label="Loading" />
  }

  return (
    <Card>
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-2">
          <div className="text-xl">{device.name}</div>
          <div>
            <ConnectionStatusText
              connected={connection.connected}
              transferStatus={getTransferStatus(completion)}
            />{' '}
            <div className="inline">{Math.trunc(completion.completion)}%</div>
          </div>
        </div>
        <ul>
          <li>
            Upload: <ByteSize bytes={connection.outBytesTotal} />
          </li>
          <li>
            Download: <ByteSize bytes={connection.inBytesTotal} />
          </li>
        </ul>
      </div>
    </Card>
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
    return <div className={`${commonClasses} text-error`}>Disconnected</div>
  } else {
    switch (transferStatus) {
      case 'up-to-date':
        return <div className={`${commonClasses} text-success`}>Up-to-date</div>
      case 'paused':
        return <div className={`${commonClasses} text-amber-400`}>Paused</div>
      case 'syncing':
        return <div className={`${commonClasses} text-blue-400`}>Syncing</div>
      default:
        return <div className={`${commonClasses} text-gray-400`}>Unknown status</div>
    }
  }
}
