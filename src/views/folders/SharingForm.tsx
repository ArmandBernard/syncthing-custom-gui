import type {
  DeviceConfiguration,
  FolderConfiguration,
  FolderDeviceConfiguration,
} from '@lib/syncthing/types/config'
import { useSyncthingQuery } from '@hooks/useSyncthingQuery.ts'
import { useConnections } from '@context/connections/useConnections.ts'
import { Checkbox } from '@components/ui/Checkbox.tsx'
import getSharedFolderStatus, { type SharedFolderStatus } from '@lib/getSharedFolderStatus.ts'
import { useDeviceID } from '@context/device-id/useDeviceID.ts'
import { CircularProgressCentred } from '@components/CircularProgressCentred.tsx'
import type { DeviceID } from '@lib/syncthing/types/common.ts'

export function SharingForm({
  effectiveConfig,
  onUpdateConfiguration,
}: {
  effectiveConfig: FolderConfiguration
  onUpdateConfiguration: (configUpdates: Partial<FolderConfiguration>) => void
}) {
  const myDeviceId = useDeviceID()
  const { data: devicesIncludingMe, isLoading: devicesLoading } =
    useSyncthingQuery('GET /config/devices')

  if (devicesLoading || !devicesIncludingMe) {
    return <CircularProgressCentred name="devices" />
  }

  const devices = devicesIncludingMe.filter((d) => d.deviceID !== myDeviceId)
  const sharedDeviceIds = new Set<DeviceID>(effectiveConfig.devices.map((d) => d.deviceID))

  return (
    <div className="flex flex-col gap-4">
      <h2>Devices</h2>
      <ul>
        {devices.map((device) => {
          const shared = sharedDeviceIds.has(device.deviceID)

          return (
            <SharingItem
              key={device.deviceID}
              device={device}
              shared={shared}
              effectiveConfig={effectiveConfig}
              onUpdateConfiguration={onUpdateConfiguration}
            />
          )
        })}
      </ul>
    </div>
  )
}

function SharingItem({
  device,
  shared,
  effectiveConfig,
  onUpdateConfiguration,
}: {
  device: DeviceConfiguration
  shared: boolean
  effectiveConfig: FolderConfiguration
  onUpdateConfiguration: (configUpdates: Partial<FolderConfiguration>) => void
}) {
  const { data: completion } = useSyncthingQuery('GET /db/completion', {
    enabled: shared,
    query: { device: device.deviceID, folder: effectiveConfig.id },
  })
  const connections = useConnections()
  const connection = connections?.connections[device.deviceID]

  function handleShareDevice(device: FolderDeviceConfiguration) {
    onUpdateConfiguration({ devices: [...effectiveConfig.devices, device] })
  }

  function handleUnshareDevice() {
    onUpdateConfiguration({
      devices: effectiveConfig.devices.filter((d) => d.deviceID !== device.deviceID),
    })
  }

  return (
    <li key={device.deviceID} className="flex gap-4 justify-between items-center">
      <Checkbox
        label={
          shared ? (
            <div className="flex gap-4 justify-between">
              <span>{device.name}</span>
              <FolderStatusText
                folderStatus={getSharedFolderStatus({
                  connection: connection,
                  completion,
                })}
              />
            </div>
          ) : (
            device.name
          )
        }
        className="flex-1"
        checked={shared}
        onChange={(event) => {
          if (event.currentTarget.checked) {
            handleShareDevice({
              deviceID: device.deviceID,
              encryptionPassword: '',
              introducedBy: '',
            })
          } else {
            handleUnshareDevice()
          }
        }}
      />
    </li>
  )
}

function FolderStatusText({ folderStatus }: { folderStatus: SharedFolderStatus }) {
  switch (folderStatus) {
    case 'accepted':
      return <span className="text-on-surface-connected">Accepted</span>
    case 'ignored':
      return <span className="text-error">Ignored</span>
    case 'not-accepted':
      return <span className="text-on-surface-variant">Not accepted</span>
    case 'disconnected':
      return <span className="text-on-surface-disconnected">Disconnected</span>
    default:
      return null
  }
}
