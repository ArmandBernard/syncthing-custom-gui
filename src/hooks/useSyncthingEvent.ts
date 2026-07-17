import { syncthingRequest } from '@lib/syncthing/client.ts'
import type { SyncthingEvent } from '@lib/syncthing/types/events'
import { useEffect, useRef } from 'react'

export function useSyncthingEvent({
  eventsToSubscribeTo,
  callback,
}: {
  eventsToSubscribeTo: SyncthingEvent['type'][]
  callback: (event: SyncthingEvent[]) => void
}) {
  const polling = useRef<boolean>(true)
  const since = useRef<number>(0)

  useEffect(() => {
    const controller = new AbortController()

    async function fetchLoop() {
      while (polling) {
        let response: SyncthingEvent[] = []
        try {
          response = await syncthingRequest('GET /events', {
            query: {
              since: since.current,
              timeout: 60,
              events: eventsToSubscribeTo.join(','),
            },
            signal: controller.signal,
          })
        } catch {
          await sleep(500)
          continue
        }

        callback(response)

        if (response.length > 0) {
          since.current = Math.max(...response.map((e) => e.id))
        }
      }
    }

    void fetchLoop()

    return () => {
      polling.current = false
      controller.abort()
    }
  }, [polling, eventsToSubscribeTo, callback])
}

async function sleep(msec: number) {
  return new Promise((resolve) => setTimeout(resolve, msec))
}
