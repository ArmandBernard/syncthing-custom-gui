import type { Completion } from '@lib/syncthing/types/db.ts'
import type { Connection } from '@lib/syncthing/types/system.ts'

export type SharedFolderStatus =
  'disconnected' | 'accepted' | 'ignored' | 'not-accepted' | 'loading' | 'unknown'

export default function getSharedFolderStatus({
  completion,
  connection,
}: {
  completion: Completion | undefined
  connection: Connection | undefined
}): SharedFolderStatus {
  if (!connection) {
    return 'loading'
  } else if (!connection.connected) {
    return 'disconnected'
  }

  if (!completion) {
    return 'loading'
  } else if (completion?.remoteState === 'valid' || completion?.remoteState === 'paused') {
    return 'accepted'
  } else if (completion?.remoteState === 'notSharing') {
    return 'ignored'
  } else if (completion?.remoteState === 'unknown') {
    return 'not-accepted'
  } else {
    return 'unknown'
  }
}
