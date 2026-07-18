import { type QueryClient, useQueryClient } from '@tanstack/react-query'
import { type PropsWithChildren, useCallback } from 'react'
import { useSyncthingEvent } from '@hooks/useSyncthingEvent.ts'
import { getEnumKeys } from '@lib/getEnumKeys.ts'
import { getEnumEntries } from '@lib/getEnumEntries.ts'
import type {
  ConfigSavedEvent,
  DeviceConnectedEvent,
  DeviceDisconnectedEvent,
  FolderCompletionEvent,
  FolderErrorsEvent,
  FolderScanProgressEvent,
  FolderSummaryEvent,
  StateChangedEvent,
  SyncthingEvent,
} from '@lib/syncthing/types/events'
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
    eventsToSubscribeTo: subscribedEventTypes,
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
  ConfigSaved: handleConfigSaved,
  DeviceConnected: handleDeviceConnectionChange,
  DeviceDisconnected: handleDeviceConnectionChange,
  FolderCompletion: handleFolderCompletion,
  FolderErrors: handleFolderStateUpdate,
  FolderScanProgress: handleFolderStateUpdate,
  FolderSummary: handleFolderSummaryUpdate,
  StateChanged: handleFolderStateUpdate,
}

// Computed once at module scope so it's a stable reference across renders
const subscribedEventTypes = getEnumKeys(eventsToInvalidationsDictionary)

async function handleFolderStateUpdate(
  events: (StateChangedEvent | FolderScanProgressEvent | FolderErrorsEvent)[],
  queryClient: QueryClient,
) {
  const uniqueAffectedFolderIds = new Set(events.flatMap((e) => e.data.folder))

  for (const folderId of uniqueAffectedFolderIds) {
    await typeSafeInvalidate(queryClient, 'GET /db/status', { query: { folder: folderId } })
  }
}

async function handleFolderSummaryUpdate(_: FolderSummaryEvent[], queryClient: QueryClient) {
  await typeSafeInvalidate(queryClient, 'GET /cluster/pending/folders')
}

async function handleFolderCompletion(events: FolderCompletionEvent[], queryClient: QueryClient) {
  const uniqueAffectedDeviceIds = new Set(events.map((e) => e.data.device))

  for (const deviceId of uniqueAffectedDeviceIds) {
    await typeSafeInvalidate(queryClient, 'GET /db/completion', { query: { device: deviceId } })
  }
}

async function handleDeviceConnectionChange(
  _events: (DeviceConnectedEvent | DeviceDisconnectedEvent)[],
  queryClient: QueryClient,
) {
  await typeSafeInvalidate(queryClient, 'GET /system/connections')
  await typeSafeInvalidate(queryClient, 'GET /stats/device')
}

async function handleConfigSaved(_events: ConfigSavedEvent[], queryClient: QueryClient) {
  await typeSafeInvalidate(queryClient, 'GET /config')
  await typeSafeInvalidate(queryClient, 'GET /config/folders')
  await typeSafeInvalidate(queryClient, 'GET /config/devices')
  await typeSafeInvalidate(queryClient, 'GET /config/gui')
}

async function typeSafeInvalidate<K extends keyof EndpointMap>(
  queryClient: QueryClient,
  key: K,
  routeOptions: RequestOptions<EndpointMap[K]> = {},
) {
  await queryClient.invalidateQueries({ queryKey: createQueryKey(key, routeOptions) })
}
