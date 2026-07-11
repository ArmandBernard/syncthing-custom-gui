import { useMutation, type UseMutationOptions } from '@tanstack/react-query'
import { syncthingRequest, SyncthingApiError, type RequestOptions } from '../lib/syncthing/client'
import type { EndpointMap } from '../lib/syncthing/endpoints'
import { useCallback } from 'react'

type ReactMutationOptions<TData, TVariables> = Omit<
  UseMutationOptions<TData, SyncthingApiError, TVariables>,
  'mutationKey' | 'mutationFn'
>

type UseSyncthingMutationOptions<K extends keyof EndpointMap> = ReactMutationOptions<
  EndpointMap[K]['response'],
  RequestOptions<EndpointMap[K]>
>

export function useSyncthingMutation<K extends keyof EndpointMap>(
  key: K,
  options?: UseSyncthingMutationOptions<K>,
) {
  const mutateFn = useCallback(
    async (options: RequestOptions<EndpointMap[K]>) => {
      const queryInfo = createQueryInfo(options)

      await syncthingRequest(key, queryInfo)
    },
    [key],
  )

  return useMutation({
    ...options,
    mutationFn: mutateFn,
  })
}

function createQueryInfo<K extends keyof EndpointMap>(options: RequestOptions<EndpointMap[K]>) {
  return {
    ...('params' in options ? { params: options.params } : {}),
    ...('query' in options ? { query: options.query } : {}),
    ...('body' in options ? { body: options.body } : {}),
  }
}
