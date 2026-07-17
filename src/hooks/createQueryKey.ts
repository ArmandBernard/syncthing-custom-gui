import type { EndpointMap } from '@lib/syncthing/endpoints.ts'

import type { RequestOptions } from '@lib/syncthing/RequestOptions.ts'

export default function createQueryKey<K extends keyof EndpointMap>(
  key: K,
  options: RequestOptions<EndpointMap[K]>,
) {
  // remove all unrelated and undefined fields for a consistent query key
  const cleanedOptions = {
    ...('params' in options ? { params: options.params } : {}),
    ...('query' in options ? { query: options.query } : {}),
    ...('body' in options ? { body: options.body } : {}),
  }

  return ['syncthing', key, cleanedOptions]
}
