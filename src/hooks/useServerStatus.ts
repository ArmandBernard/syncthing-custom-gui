import { useSyncthingQuery } from './useSyncthingQuery'

export type ServerStatus = 'checking' | 'online' | 'unauthorized' | 'offline'

const POLL_INTERVAL_MS = 5000

export function useServerStatus(): ServerStatus {
  const { error, isPending } = useSyncthingQuery('GET /system/ping', {
    refetchInterval: POLL_INTERVAL_MS,
  })

  if (isPending) return 'checking'
  if (error) return error.status === 401 || error.status === 403 ? 'unauthorized' : 'offline'
  return 'online'
}
