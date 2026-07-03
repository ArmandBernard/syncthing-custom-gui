import type { Connection } from './syncthing/types/system.ts'
import type { ConnectionStatus } from './ConnectionStatus.ts'

export default function getConnectionStatus(connection: Connection): ConnectionStatus {
  if (!connection.connected) {
    return 'disconnected'
  }
  if (connection.paused) {
    return 'paused'
  }
  if (connection.connected) {
    return 'connected'
  }

  return 'unknown'
}
