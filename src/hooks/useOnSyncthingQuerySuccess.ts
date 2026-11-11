import { useEffect } from 'preact/hooks'
import { hashKey, useQueryClient } from '@tanstack/react-query'
import type { EndpointMap } from '@lib/syncthing/endpoints.ts'
import type { RequestOptions } from '@lib/syncthing/RequestOptions.ts'
import createQueryKey from '@hooks/createQueryKey.ts'

/**
 * Calls `onSuccess` with the response each time a fetch of the given Syncthing query succeeds,
 * including refetches that return identical data.
 * `onSuccess` is called from outside render, so it is safe to set state or touch refs in it.
 */
export function useOnSyncthingQuerySuccess<K extends keyof EndpointMap>(
  key: K,
  onSuccess: (data: EndpointMap[K]['response']) => void,
  options: RequestOptions<EndpointMap[K]> = {},
) {
  const queryClient = useQueryClient()
  const queryHash = hashKey(createQueryKey(key, options))

  useEffect(() => {
    return queryClient.getQueryCache().subscribe((event) => {
      if (
        event.type === 'updated' &&
        event.action.type === 'success' &&
        event.query.queryHash === queryHash
      ) {
        // The cache is untyped, but entries under this hash were written by `useSyncthingQuery`
        // for this same `key`, so the response type is known.
        onSuccess(event.query.state.data as EndpointMap[K]['response'])
      }
    })
  }, [queryClient, queryHash, onSuccess])
}
