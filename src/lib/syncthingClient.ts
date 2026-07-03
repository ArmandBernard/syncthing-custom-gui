export type ServerStatus = 'checking' | 'online' | 'unauthorized' | 'offline'

export async function pingSyncthing(apiKey: string): Promise<ServerStatus> {
  try {
    const response = await fetch('/rest/system/ping', {
      headers: { 'X-API-Key': apiKey },
    })
    if (response.ok) return 'online'
    if (response.status === 401 || response.status === 403) return 'unauthorized'
    return 'offline'
  } catch {
    return 'offline'
  }
}
