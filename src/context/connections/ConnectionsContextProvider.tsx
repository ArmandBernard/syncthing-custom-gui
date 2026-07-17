import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useQueries } from '@tanstack/react-query'
import { useSyncthingQuery } from '@hooks/useSyncthingQuery.ts'
import { syncthingRequest } from '@lib/syncthing/client.ts'
import createQueryKey from '@hooks/createQueryKey.ts'
import { ConnectionsContext } from './ConnectionsContext.ts'

const TRANSFERRING_POLL_INTERVAL = 2000
const IDLE_POLL_INTERVAL = 15000

export function ConnectionsContextProvider({ children }: { children: ReactNode }) {
  const [isTransferring, setIsTransferring] = useState(false)
  const wasTransferring = useRef(false)

  const { data: devices } = useSyncthingQuery('GET /config/devices')
  const { data: connections, refetch: refetchConnections } = useSyncthingQuery(
    'GET /system/connections',
    {
      refetchInterval: isTransferring ? TRANSFERRING_POLL_INTERVAL : IDLE_POLL_INTERVAL,
    },
  )

  // Only devices we're actually connected to can be transferring right now;
  // a disconnected device stuck below 100% shouldn't force fast polling forever.
  const connectedDeviceIds = useMemo(
    () =>
      (devices ?? [])
        .filter((device) => connections?.connections[device.deviceID]?.connected)
        .map((device) => device.deviceID),
    [devices, connections],
  )

  // Kept live by the FolderCompletion invalidation in InvalidationLayer.tsx, not polled.
  const completions = useQueries({
    queries: connectedDeviceIds.map((deviceID) => ({
      queryKey: createQueryKey('GET /db/completion', { query: { device: deviceID } }),
      queryFn: () => syncthingRequest('GET /db/completion', { query: { device: deviceID } }),
    })),
  })

  const anyDeviceStillTransferring = completions.some(
    (completion) =>
      completion.data &&
      (completion.data.needBytes > 0 ||
        completion.data.needItems > 0 ||
        completion.data.needDeletes > 0),
  )

  useEffect(() => {
    // Capture one more sample right away on the transferring->idle edge, so
    // the rate chart reflects the stop instead of replaying the last
    // (nonzero) rate for up to IDLE_POLL_INTERVAL until the next slow poll.
    if (wasTransferring.current && !anyDeviceStillTransferring) {
      void refetchConnections()
    }
    wasTransferring.current = anyDeviceStillTransferring

    setIsTransferring(anyDeviceStillTransferring)
  }, [anyDeviceStillTransferring, refetchConnections])

  return <ConnectionsContext.Provider value={connections}>{children}</ConnectionsContext.Provider>
}
