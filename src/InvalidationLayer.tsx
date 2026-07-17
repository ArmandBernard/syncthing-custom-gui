import { type QueryClient, useQueryClient } from '@tanstack/react-query'
import { type PropsWithChildren, useCallback } from 'react'
import { useSyncthingEvent } from '@hooks/useSyncthingEvent.ts'
import { getEnumKeys } from '@lib/getEnumKeys.ts'
import { getEnumEntries } from '@lib/getEnumEntries.ts'
import type { StateChangedEvent, SyncthingEvent } from '@lib/syncthing/types/events'
import type { EndpointMap } from '@lib/syncthing/endpoints.ts'
import type { RequestOptions } from '@lib/syncthing/RequestOptions.ts'
import createQueryKey from '@hooks/createQueryKey.ts'

export function InvalidationLayer({ children }: PropsWithChildren) {
  const queryClient = useQueryClient()

  const handleNewEvent = useCallback(
    (events: SyncthingEvent[]) => {
      const byType = Object.groupBy(events, (e) => e.type)

      for (const [type, eventsOfType] of getEnumEntries(byType)) {
        void invokeHandler(type, eventsOfType, queryClient)
      }
    },
    [queryClient],
  )

  useSyncthingEvent({
    eventsToSubscribeTo: getEnumKeys(eventsToInvalidationsDictionary),
    callback: handleNewEvent,
  })

  return children
}

function invokeHandler<K extends SyncthingEvent['type']>(
  type: K,
  events: Extract<SyncthingEvent, { type: K }>[],
  queryClient: QueryClient,
) {
  switch (type) {
    case 'StateChanged':
  }

  return eventsToInvalidationsDictionary[type]?.(events, queryClient)
}

type SyncthingEventDictionary = {
  [K in SyncthingEvent['type']]?: (
    events: Extract<SyncthingEvent, { type: K }>[],
    queryClient: QueryClient,
  ) => Promise<void>
}

const eventsToInvalidationsDictionary: SyncthingEventDictionary = {
  StateChanged: handleFolderStateUpdate,
}

async function handleFolderStateUpdate(events: StateChangedEvent[], queryClient: QueryClient) {
  const uniqueAffectedFolderIds = new Set(events.flatMap((e) => e.data.folder))

  for (const folderId of uniqueAffectedFolderIds) {
    await typeSafeInvalidate(queryClient, 'GET /db/status', { query: { folder: folderId } })
  }
}

async function typeSafeInvalidate<K extends keyof EndpointMap>(
  queryClient: QueryClient,
  key: K,
  routeOptions: RequestOptions<EndpointMap[K]> = {},
) {
  await queryClient.invalidateQueries({ queryKey: createQueryKey(key, routeOptions) })
}
