/** Syncthing device ID (54-char base32, e.g. "ABCDEFG-...") */
export type DeviceID = string

/** Folder ID as configured by the user, e.g. "default" */
export type FolderID = string

/** RFC3339 timestamp string as emitted by Go's time.Time JSON marshaling */
export type ISODateTime = string

/** Mixin for the several DB/folder endpoints that return `{ ...arrays, page, perpage }`. */
export interface Paginated {
  page: number
  perpage: number
}
