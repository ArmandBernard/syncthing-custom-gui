import type { DeviceID } from '../common'
import type { Size } from './common'

export type FolderType = 'sendreceive' | 'sendonly' | 'receiveonly' | 'receiveencrypted'
export type PullOrder =
  | 'random'
  | 'alphabetic'
  | 'smallestFirst'
  | 'largestFirst'
  | 'oldestFirst'
  | 'newestFirst'
export type BlockPullOrder = 'standard' | 'random' | 'inOrder'
export type CopyRangeMethod =
  | 'standard'
  | 'ioctl'
  | 'copy_file_range'
  | 'sendfile'
  | 'duplicate_extents'
  | 'all'
/** Go type is a bare string; "basic" and "fake" are the only built-in values. */
export type FilesystemType = 'basic' | 'fake' | (string & {})

export interface FolderDeviceConfiguration {
  deviceID: DeviceID
  introducedBy: DeviceID | ''
  encryptionPassword: string
}

export interface VersioningConfiguration {
  /** '' (disabled) | 'simple' | 'trashcan' | 'staggered' | 'external' | custom plugin name */
  type: string
  /** Shape depends on `type`. Known keys: trashcan -> cleanoutDays; staggered ->
   *  maxAge, cleanInterval, versionsPath; external -> command; simple -> keep. */
  params: Record<string, string>
  cleanupIntervalS: number
  fsPath: string
  fsType: FilesystemType
}

export interface XattrFilterEntry {
  match: string
  permit: boolean
}

/** New in Syncthing's main branch — not yet in the rendered docs for the last
 *  tagged release. Confirm your target server version supports this. */
export interface XattrFilter {
  entries: XattrFilterEntry[]
  maxSingleEntrySize: number
  maxTotalSize: number
}

export interface FolderConfiguration {
  id: string
  label: string
  group: string
  filesystemType: FilesystemType
  path: string
  type: FolderType
  devices: FolderDeviceConfiguration[]
  rescanIntervalS: number
  fsWatcherEnabled: boolean
  fsWatcherDelayS: number
  fsWatcherTimeoutS: number
  ignorePerms: boolean
  autoNormalize: boolean
  minDiskFree: Size
  versioning: VersioningConfiguration
  copiers: number
  pullerMaxPendingKiB: number
  hashers: number
  order: PullOrder
  ignoreDelete: boolean
  scanProgressIntervalS: number
  pullerPauseS: number
  /** New in main, not yet in the rendered docs. */
  pullerDelayS?: number
  maxConflicts: number
  disableSparseFiles: boolean
  paused: boolean
  markerName: string
  copyOwnershipFromParent: boolean
  modTimeWindowS: number
  maxConcurrentWrites: number
  disableFsync: boolean
  blockPullOrder: BlockPullOrder
  copyRangeMethod: CopyRangeMethod
  caseSensitiveFS: boolean
  junctionsAsDirs: boolean
  syncOwnership: boolean
  sendOwnership: boolean
  syncXattrs: boolean
  sendXattrs: boolean
  blockIndexing: boolean
  /** New in main, not yet in the rendered docs. */
  xattrFilter?: XattrFilter
}
