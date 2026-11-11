import { useMutation, type UseMutationOptions } from '@tanstack/react-query'
import { useCallback } from 'preact/hooks'
import { syncthingRequest } from '@lib/syncthing/syncthingRequest'
import type { EndpointMap } from '@lib/syncthing/endpoints'
import type { RequestOptions } from '@lib/syncthing/RequestOptions.ts'
import { type SyncthingApiError } from '@lib/syncthing/SyncthingApiError.ts'

type UseSyncthingBatchMutationOptions<K extends keyof EndpointMap> = Omit<
  UseMutationOptions<void, SyncthingApiError, RequestOptions<EndpointMap[K]>[]>,
  'mutationKey' | 'mutationFn'
>

/**
 * Like `useSyncthingMutation`, but `mutateAsync` takes a list of requests to the same endpoint
 * and sends them all in parallel as ONE mutation.
 *
 * Calling a plain `useSyncthingMutation` in a loop doesn't work well: TanStack Query's
 * `useMutation` only tracks the most recently started call, so `isPending` and `error` describe
 * just that call. Here `isPending` stays true until every request has settled (and `onSettled`
 * has finished, if it returns a promise), and `error` is set if any of them failed.
 *
 * All requests are always attempted, even if one fails. If several fail, the first failure (in
 * request order) is the error.
 */
export function useSyncthingBatchMutation<K extends keyof EndpointMap>(
  key: K,
  options?: UseSyncthingBatchMutationOptions<K>,
) {
  const mutateFn = useCallback(
    async (requests: RequestOptions<EndpointMap[K]>[]) => {
      const results = await Promise.allSettled(
        requests.map((request) => syncthingRequest(key, request)),
      )

      const firstFailure = results.find((result) => result.status === 'rejected')
      if (firstFailure) {
        throw firstFailure.reason
      }
    },
    [key],
  )

  return useMutation({
    ...options,
    mutationFn: mutateFn,
  })
}
