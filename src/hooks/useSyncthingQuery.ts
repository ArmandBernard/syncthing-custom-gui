import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { syncthingRequest, SyncthingApiError } from '@lib/syncthing/client'
import type { EndpointMap } from '@lib/syncthing/endpoints'
import { useApiKey } from './useApiKey'
import type { RequestOptions } from '@lib/syncthing/RequestOptions.ts'
import createQueryKey from '@hooks/createQueryKey.ts'

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

  return useQuery<EndpointMap[K]['response'], SyncthingApiError>({
    ...reactQueryOptions,
    queryKey: createQueryKey(key, options),
    queryFn: () => syncthingRequest(key, options),
    enabled: apiKey !== null && ((enabled as boolean | undefined) ?? true),
  })
}
