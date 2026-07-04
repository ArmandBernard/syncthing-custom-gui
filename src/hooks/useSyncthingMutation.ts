import { useMutation, type UseMutationOptions } from '@tanstack/react-query'
import { syncthingRequest, SyncthingApiError, type RequestOptions } from '../lib/syncthing/client'
import type { EndpointMap } from '../lib/syncthing/endpoints'

type ReactMutationOptions<TData> = Omit<
  UseMutationOptions<TData, SyncthingApiError>,
  'mutationKey' | 'mutationFn'
>

type UseSyncthingMutationOptions<E, TData> = RequestOptions<E> & ReactMutationOptions<TData>

export function useSyncthingMutation<K extends keyof EndpointMap>(
  key: K,
  options: UseSyncthingMutationOptions<EndpointMap[K], EndpointMap[K]['response']>,
) {
  const queryInfo = {
    ...('params' in options ? { params: options.params } : {}),
    ...('query' in options ? { query: options.query } : {}),
    ...('body' in options ? { body: options.body } : {}),
  }

  return useMutation<EndpointMap[K]['response'], SyncthingApiError>({
    ...options,
    mutationKey: ['syncthing', key, queryInfo],
    mutationFn: () => syncthingRequest(key, queryInfo),
  })
}
