import type { LocalChangeDetectedEvent, RemoteChangeDetectedEvent, SyncthingEvent } from '../types/events'

export interface EventEndpoints {
  'GET /events': {
    query?: { since?: number; limit?: number; timeout?: number; events?: string }
    response: SyncthingEvent[]
  }
  /** Server always restricts this to LocalChangeDetected/RemoteChangeDetected. */
  'GET /events/disk': {
    query?: { since?: number; limit?: number; timeout?: number }
    response: (LocalChangeDetectedEvent | RemoteChangeDetectedEvent)[]
  }
}
