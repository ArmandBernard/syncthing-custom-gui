import { useMutation, type UseMutationOptions } from '@tanstack/react-query'
import { syncthingRequest } from '@lib/syncthing/syncthingRequest'
import type { EndpointMap } from '@lib/syncthing/endpoints'
import { useCallback } from 'react'
import type { RequestOptions } from '@lib/syncthing/RequestOptions.ts'
import { SyncthingApiError } from '@lib/syncthing/SyncthingApiError.ts'

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
      await syncthingRequest(key, options)
    },
    [key],
  )

  return useMutation({
    ...options,
    mutationFn: mutateFn,
  })
}
