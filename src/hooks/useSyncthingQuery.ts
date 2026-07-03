import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { syncthingRequest, SyncthingApiError, type RequestOptions } from '../lib/syncthing/client'
import type { EndpointMap } from '../lib/syncthing/endpoints'
import { useApiKey } from './useApiKey'

type ReactQueryOptions<TData> = Omit<
  UseQueryOptions<TData, SyncthingApiError>,
  'queryKey' | 'queryFn'
>

type UseSyncthingQueryOptions<E, TData> = RequestOptions<E> & ReactQueryOptions<TData>

export function useSyncthingQuery<K extends keyof EndpointMap>(
  key: K,
  ...args: object extends UseSyncthingQueryOptions<EndpointMap[K], EndpointMap[K]['response']>
    ? [options?: UseSyncthingQueryOptions<EndpointMap[K], EndpointMap[K]['response']>]
    : [options: UseSyncthingQueryOptions<EndpointMap[K], EndpointMap[K]['response']>]
) {
  const { apiKey } = useApiKey()
  const { params, query, body, enabled, ...reactQueryOptions } = (args[0] ?? {}) as Record<
    string,
    unknown
  >

  return useQuery<EndpointMap[K]['response'], SyncthingApiError>({
    ...reactQueryOptions,
    queryKey: ['syncthing', key, { params, query, body }],
    queryFn: () => syncthingRequest(key, { params, query, body } as never),
    enabled: apiKey !== null && ((enabled as boolean | undefined) ?? true),
  })
}
