import { useSyncthingQuery } from '@hooks/useSyncthingQuery.ts'
import type { Connection } from '@lib/syncthing/types/system.ts'
import { Device } from './Device.tsx'
import { CircularProgressCentred } from '@components/CircularProgressCentred.tsx'

import { useConnections } from '@context/connections/useConnections.ts'
import { lazy, Suspense, useState } from 'preact/compat'
import type { DeviceID, FolderID } from '@lib/syncthing/types/common.ts'
import { IconButton } from '@components/ui/IconButton.tsx'
import { MoreVertIcon } from '@components/icons/MoreVertIcon.tsx'
import { Menu } from '@components/ui/menu/Menu.tsx'

const DeviceDialog = lazy(() => import('./DeviceDialog.tsx'))

export function RemoteDevices() {
  const [editingDeviceId, setEditingDeviceId] = useState<DeviceID | undefined>(undefined)
  const [creatingDevice, setCreatingDevice] = useState<boolean>(false)
  const { data: devices, isLoading: devicesLoading } = useSyncthingQuery('GET /config/devices')
  const { data: stats, isLoading: statsAreLoading } = useSyncthingQuery('GET /stats/device')
  const connections = useConnections()

  if (!connections || devicesLoading || !devices || statsAreLoading || !stats) {
    return <CircularProgressCentred name="remote devices" />
  }

  function handleEditClick(deviceID: FolderID) {
    setEditingDeviceId(deviceID)
  }
  function handleAddClick() {
    setCreatingDevice(true)
  }
  function handleEditClose() {
    setEditingDeviceId(undefined)
  }
  function handleCreateClose() {
    setCreatingDevice(false)
  }

  const grouped = Object.groupBy(devices, (device) => device.group)
  const editingDevice = devices.find((f) => f.deviceID === editingDeviceId)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center gap-4">
        <h2 className="text-2xl">Remote devices</h2>
        <Menu
          button={
            <IconButton aria-label="Device actions">
              <MoreVertIcon />
            </IconButton>
          }
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Menu.Item onClick={handleAddClick}>Add device</Menu.Item>
        </Menu>
      </div>
      {Object.entries(grouped)
        .toSorted((a, b) => a[0].localeCompare(b[0]))
        .map(([group, value]) => (
          <>
            {group && <h3 className="text-xl">{group}</h3>}
            <ul className="flex flex-col gap-2">
              {value!
                .toSorted((da, db) => da.name.localeCompare(db.name))
                .map((device) => {
                  const connection: Connection | undefined =
                    connections.connections[device.deviceID]
                  const deviceStats = stats[device.deviceID]

                  // typically happens if this connection is you
                  if (!connection) {
                    return null
                  }

                  return (
                    <li key={device.deviceID}>
                      <Device
                        device={device}
                        connection={connection}
                        stats={deviceStats}
                        onEditClick={() => handleEditClick(device.deviceID)}
                      />
                    </li>
                  )
                })}
            </ul>
          </>
        ))}
      <Suspense fallback={null}>
        <DeviceDialog
          isOpen={!!editingDevice}
          key={editingDeviceId}
          initialConfig={editingDevice}
          onClose={handleEditClose}
        />
        <DeviceDialog
          isOpen={creatingDevice}
          initialConfig={undefined}
          onClose={handleCreateClose}
        />
      </Suspense>
    </div>
  )
}
