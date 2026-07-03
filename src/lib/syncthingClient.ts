import {syncthingRequest, SyncthingApiError} from './syncthing/client'

export type ServerStatus = 'checking' | 'online' | 'unauthorized' | 'offline'

export async function pingSyncthing(apiKey: string): Promise<ServerStatus> {
  try {
    await syncthingRequest(apiKey, 'GET /system/ping')
    return 'online'
  } catch (error) {
    if (error instanceof SyncthingApiError && (error.status === 401 || error.status === 403)) {
      return 'unauthorized'
    }
    return 'offline'
  }
}
