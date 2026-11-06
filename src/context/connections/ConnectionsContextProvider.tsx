import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { useQueries } from '@tanstack/react-query'
import { useSyncthingQuery } from '@hooks/useSyncthingQuery.ts'
import { syncthingRequest } from '@lib/syncthing/syncthingRequest.ts'
import createQueryKey from '@hooks/createQueryKey.ts'
import { ConnectionsContext } from './ConnectionsContext.ts'

const TRANSFERRING_POLL_INTERVAL = 2000
const IDLE_POLL_INTERVAL = 15000
// How long to keep polling fast after a transfer stops
const TRANSFERRING_COOLDOWN = 10000

export function ConnectionsContextProvider({ children }: { children: ReactNode }) {
  const [wasTransferring, setWasTransferring] = useState(false)
  const [isCoolingDown, setIsCoolingDown] = useState(false)

  const { data: devices } = useSyncthingQuery('GET /config/devices')

  // Kept live by the FolderCompletion invalidation in InvalidationLayer.tsx, not polled.
  const completions = useQueries({
    queries:
      devices?.map((device) => ({
        queryKey: createQueryKey('GET /db/completion', { query: { device: device.deviceID } }),
        queryFn: () =>
          syncthingRequest('GET /db/completion', { query: { device: device.deviceID } }),
      })) ?? [],
  })

  const anyDeviceStillTransferring = completions.some(
    (completion) =>
      completion.data &&
      (completion.data.needBytes > 0 ||
        completion.data.needItems > 0 ||
        completion.data.needDeletes > 0),
  )

  // Start the cooldown the moment transfers stop, and cancel it if they start again. Adjusted
  // during render (rather than in an effect) so the polling rate never lags a render behind:
  // https://react.dev/learn/you-might-not-need-an-effect
  if (anyDeviceStillTransferring !== wasTransferring) {
    setWasTransferring(anyDeviceStillTransferring)
    setIsCoolingDown(!anyDeviceStillTransferring)
  }

  // Keep polling fast for a while after a transfer stops.
  useEffect(() => {
    if (!isCoolingDown) return
    const timeout = setTimeout(() => setIsCoolingDown(false), TRANSFERRING_COOLDOWN)
    return () => clearTimeout(timeout)
  }, [isCoolingDown])

  const shouldUseHighPollingRate = anyDeviceStillTransferring || isCoolingDown

  const { data: connections } = useSyncthingQuery('GET /system/connections', {
    refetchInterval: shouldUseHighPollingRate ? TRANSFERRING_POLL_INTERVAL : IDLE_POLL_INTERVAL,
  })

  return <ConnectionsContext.Provider value={connections}>{children}</ConnectionsContext.Provider>
}
