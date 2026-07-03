import { useQuery } from '@tanstack/react-query'
import { pingSyncthing, type ServerStatus } from '../lib/syncthingClient'

const POLL_INTERVAL_MS = 5000

export function useServerStatus(apiKey: string | null): ServerStatus {
  const { data } = useQuery({
    queryKey: ['server-status', apiKey],
    queryFn: () => pingSyncthing(apiKey as string),
    enabled: apiKey !== null,
    refetchInterval: POLL_INTERVAL_MS,
  })

  return data ?? 'checking'
}
