import { useQueryClient } from '@tanstack/react-query'
import type { EndpointMap } from '../lib/syncthing/endpoints'
import { useCallback } from 'react'

export function useSyncthingInvalidate<K extends keyof EndpointMap>(
  key: K,
  options?: EndpointMap[K],
) {
  const client = useQueryClient()

  return useCallback(() => {
    const queryInfo = options
      ? {
          ...('params' in options ? { params: options.params } : {}),
          ...('query' in options ? { query: options.query } : {}),
          ...('body' in options ? { body: options.body } : {}),
        }
      : undefined

    return client.invalidateQueries({
      queryKey: queryInfo ? ['syncthing', key, queryInfo] : ['syncthing', key],
    })
  }, [key, client, options])
}
