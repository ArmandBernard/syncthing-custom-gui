import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { syncthingRequest } from '@lib/syncthing/syncthingRequest'
import type { EndpointMap } from '@lib/syncthing/endpoints'
import type { RequestOptions } from '@lib/syncthing/RequestOptions.ts'
import createQueryKey from '@hooks/createQueryKey.ts'
import { SyncthingApiError } from '@lib/syncthing/SyncthingApiError.ts'

type ReactQueryOptions<TData> = Omit<
  UseQueryOptions<TData, SyncthingApiError>,
  'queryKey' | 'queryFn'
>

type UseSyncthingQueryOptions<E, TData> = RequestOptions<E> & ReactQueryOptions<TData>

export function useSyncthingQuery<K extends keyof EndpointMap>(
  key: K,
  options: UseSyncthingQueryOptions<EndpointMap[K], EndpointMap[K]['response']> | undefined = {},
) {
  const { enabled, ...reactQueryOptions } = options

  return useQuery<EndpointMap[K]['response'], SyncthingApiError>({
    ...reactQueryOptions,
    queryKey: createQueryKey(key, options),
    queryFn: () => syncthingRequest(key, options),
    enabled: (enabled as boolean | undefined) ?? true,
  })
}
