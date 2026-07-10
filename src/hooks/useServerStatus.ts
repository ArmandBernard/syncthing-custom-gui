import { useSyncthingQuery } from './useSyncthingQuery'
import { useApiKey } from './useApiKey.ts'

export type ServerStatus = 'checking' | 'online' | 'unauthorized' | 'offline'

const POLL_INTERVAL_MS = 30000

export function useServerStatus(): ServerStatus {
  const { apiKey } = useApiKey()
  const { error, isPending } = useSyncthingQuery('GET /system/ping', {
    refetchInterval: POLL_INTERVAL_MS,
  })

  if (!apiKey) {
    return 'unauthorized'
  }
  if (isPending) return 'checking'
  if (error) {
    return error.status === 401 || error.status === 403 ? 'unauthorized' : 'offline'
  }
  return 'online'
}
