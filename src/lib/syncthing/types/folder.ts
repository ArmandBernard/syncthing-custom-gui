import type { FolderID, ISODateTime, Paginated } from './common'

export interface FolderFileError {
  path: string
  error: string
}

export interface FolderErrorsResponse extends Paginated {
  folder: FolderID
  errors: FolderFileError[]
}

// GET /rest/folder/pullerrors is a deprecated alias with an identical response
// shape to /folder/errors (confirmed via docs) — intentionally not duplicated
// as a separate endpoint entry.

export interface FolderFileVersion {
  versionTime: ISODateTime
  modTime: ISODateTime
  size: number
}

/** Keyed by file path relative to folder root. */
export type FolderVersionsResponse = Record<string, FolderFileVersion[]>

/** POST body: file path -> the `versionTime` (from GET) to restore. */
export type FolderVersionsRestoreRequest = Record<string, ISODateTime>

/** Inferred — docs give no example JSON for the POST response, only prose
 *  ("an object containing any error messages... with the file path as attribute
 *  name"). Verify against a live server. */
export type FolderVersionsRestoreResponse = Record<string, string>
