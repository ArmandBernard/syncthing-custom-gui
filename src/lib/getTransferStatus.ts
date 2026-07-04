import type { Completion } from './syncthing/types/db.ts'
import type { TransferStatus } from './TransferStatus.ts'

export function getTransferStatus(completion: Completion): TransferStatus {
  if (completion.remoteState === 'paused') {
    return 'paused'
  } else if (completion.completion === 100) {
    return 'up-to-date'
  } else if (completion.remoteState === 'valid') {
    return 'syncing'
  }
  return 'unknown'
}
