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
  options: UseSyncthingQueryOptions<EndpointMap[K], EndpointMap[K]['response']> | undefined = {},
) {
  const { apiKey } = useApiKey()
  const { enabled, ...reactQueryOptions } = options

  const queryInfo = {
    ...('params' in options ? { params: options.params } : {}),
    ...('query' in options ? { query: options.query } : {}),
    ...('body' in options ? { body: options.body } : {}),
  }

  return useQuery<EndpointMap[K]['response'], SyncthingApiError>({
    ...reactQueryOptions,
    queryKey: ['syncthing', key, queryInfo],
    queryFn: () => syncthingRequest(key, queryInfo),
    enabled: apiKey !== null && ((enabled as boolean | undefined) ?? true),
  })
}
