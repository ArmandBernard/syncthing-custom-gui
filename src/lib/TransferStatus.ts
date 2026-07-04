export type TransferStatus =
  | 'syncing'
  | 'up-to-date'
  /**
   * This means paused in the remote device side
   */
  | 'paused'
  | 'unknown'
