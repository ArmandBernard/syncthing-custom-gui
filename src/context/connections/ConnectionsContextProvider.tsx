import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
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
  const [shouldUseHighPollingRate, setShouldUseHighPollingRate] = useState(false)
  const cooldownTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

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

  const { data: connections } = useSyncthingQuery('GET /system/connections', {
    refetchInterval: shouldUseHighPollingRate ? TRANSFERRING_POLL_INTERVAL : IDLE_POLL_INTERVAL,
  })

  const anyDeviceStillTransferring = completions.some(
    (completion) =>
      completion.data &&
      (completion.data.needBytes > 0 ||
        completion.data.needItems > 0 ||
        completion.data.needDeletes > 0),
  )

  useEffect(() => {
    // Immediately increase polling speed.
    if (anyDeviceStillTransferring) {
      clearTimeout(cooldownTimeout.current)
      cooldownTimeout.current = undefined
      setShouldUseHighPollingRate(true)
      return
    }

    if (shouldUseHighPollingRate && cooldownTimeout.current === undefined) {
      cooldownTimeout.current = setTimeout(() => {
        cooldownTimeout.current = undefined
        setShouldUseHighPollingRate(false)
      }, TRANSFERRING_COOLDOWN)
    }

    return () => clearTimeout(cooldownTimeout.current)
  }, [anyDeviceStillTransferring, shouldUseHighPollingRate])

  return <ConnectionsContext.Provider value={connections}>{children}</ConnectionsContext.Provider>
}
