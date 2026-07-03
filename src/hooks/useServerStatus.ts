import { useSyncthingQuery } from './useSyncthingQuery'

export type ServerStatus = 'checking' | 'online' | 'unauthorized' | 'offline'

const POLL_INTERVAL_MS = 5000

export function useServerStatus(apiKey: string | null): ServerStatus {
  const { error, isPending } = useSyncthingQuery(apiKey, 'GET /system/ping', {
    refetchInterval: POLL_INTERVAL_MS,
  })

  if (!apiKey || isPending) return 'checking'
  if (error) return error.status === 401 || error.status === 403 ? 'unauthorized' : 'offline'
  return 'online'
}
