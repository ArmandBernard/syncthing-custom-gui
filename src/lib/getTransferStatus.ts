import type { Completion } from './syncthing/types/db.ts'
import type { TransferStatus } from './TransferStatus.ts'

export function getTransferStatus(completion: Completion): TransferStatus {
  // This is called with device-aggregate completion (no `folder` filter), and
  // Syncthing has no meaningful way to aggregate remoteState across a
  // device's folders — it reports 'unknown' here regardless of actual state,
  // even at completion 100. So status is derived purely from the numeric
  // fields, which do aggregate correctly. (Pause is already handled upstream
  // via Connection.paused, before this is consulted.)

  // `completion` can round to 100 while needBytes/needItems/needDeletes are
  // still nonzero (e.g. finishing a large file, or only deletes pending), so
  // the need* fields are checked directly rather than trusting the rounding.
  const hasPendingWork =
    completion.needBytes > 0 || completion.needItems > 0 || completion.needDeletes > 0

  return hasPendingWork || completion.completion < 100 ? 'syncing' : 'up-to-date'
}
