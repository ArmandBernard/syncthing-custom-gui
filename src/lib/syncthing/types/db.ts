import type { DeviceID, ISODateTime, Paginated } from './common'

export type FolderState = 'idle' | 'scanning' | 'syncing' | 'error'
export type RemoteFolderState = 'unknown' | 'notSharing' | 'paused' | 'valid'

/** Docs' /db/browse example only shows FILE/DIRECTORY; symlink variants are
 *  inferred by analogy with Syncthing's protobuf enum, not directly confirmed. */
export type FileInfoType =
  | 'FILE_INFO_TYPE_FILE'
  | 'FILE_INFO_TYPE_DIRECTORY'
  | 'FILE_INFO_TYPE_SYMLINK_FILE'
  | 'FILE_INFO_TYPE_SYMLINK_DIRECTORY'

/** Response of GET /db/status, and reused as the `summary` payload of the
 *  FolderSummary event (same underlying Go struct). */
export interface FolderStatus {
  globalBytes: number
  globalDeleted: number
  globalDirectories: number
  globalFiles: number
  globalSymlinks: number
  globalTotalItems: number
  ignorePatterns: boolean
  inSyncBytes: number
  inSyncFiles: number
  /** @deprecated always empty string, per docs */
  invalid: string
  localBytes: number
  localDeleted: number
  localDirectories: number
  localFiles: number
  localSymlinks: number
  localTotalItems: number
  needBytes: number
  needDeletes: number
  needDirectories: number
  needFiles: number
  needSymlinks: number
  needTotalItems: number
  pullErrors: number
  receiveOnlyChangedBytes: number
  receiveOnlyChangedDeletes: number
  receiveOnlyChangedDirectories: number
  receiveOnlyChangedFiles: number
  receiveOnlyChangedSymlinks: number
  receiveOnlyTotalItems: number
  sequence: number
  state: FolderState
  stateChanged: ISODateTime
  /** @deprecated functionally equivalent to `sequence` */
  version: number
  /** Present in the FolderSummary event's example but absent from the plain
   *  GET /db/status example — presence may depend on Syncthing version. */
  remoteSequence?: Record<DeviceID, number>
  watchError?: string
  error?: string
  errors?: number
}

/** Full file record as returned by GET /db/file's `global`/`local` fields. */
export interface FileInfo {
  name: string
  type: FileInfoType
  size: number
  permissions: string // octal string, e.g. "0755"
  modified: ISODateTime
  modifiedBy: DeviceID
  deleted: boolean
  invalid: boolean
  ignored: boolean
  mustRescan: boolean
  noPermissions: boolean
  numBlocks: number
  sequence: number
  localFlags: number
  version: string[] // e.g. ["523ITIE:1664345275"]
  inodeChange: ISODateTime
  /** Shape not detailed in docs (shown only as `{}` in the example). */
  platform: Record<string, unknown>
}

export interface FileAvailability {
  id: DeviceID
  fromTemporary: boolean
}

export interface DbFileMtime {
  err: string | null
  value: {
    real: ISODateTime
    virtual: ISODateTime
  }
}

export interface DbFileResponse {
  availability: FileAvailability[]
  global: FileInfo
  /** `{}` when the file doesn't exist locally, per docs example. */
  local: FileInfo | Record<string, never>
  mtime: DbFileMtime
}

export type BrowseEntryType = 'FILE_INFO_TYPE_FILE' | 'FILE_INFO_TYPE_DIRECTORY'

/** GET /db/browse returns a recursive tree. `children` is present only on
 *  directory entries that have at least one descendant within the requested `levels`. */
export interface BrowseEntry {
  name: string
  modTime: ISODateTime
  size: number
  type: BrowseEntryType
  children?: BrowseEntry[]
}

export interface Completion {
  completion: number // 0-100
  globalBytes: number
  needBytes: number
  globalItems: number
  needItems: number
  needDeletes: number
  remoteState: RemoteFolderState
  sequence: number
}

export interface DbIgnoresResponse {
  ignore: string[] | null
  expanded: string[]
}

export interface DbIgnoresRequest {
  ignore: string[]
}

/** NOTE: docs' examples for /db/need, /db/localchanged, /db/remoteneed show a
 *  reduced field set compared to the full FileInfo shown for /db/file. Modeled
 *  as FileInfo[] as a best-effort superset — verify against a live server. */
export interface DbLocalChangedResponse extends Paginated {
  files: FileInfo[]
}

export interface DbNeedResponse extends Paginated {
  progress: FileInfo[]
  queued: FileInfo[]
  rest: FileInfo[]
}

export interface DbRemoteNeedResponse extends Paginated {
  files: FileInfo[]
}
