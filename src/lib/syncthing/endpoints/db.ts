import type { DeviceID, FolderID } from '../types/common'
import type {
  BrowseEntry,
  Completion,
  DbFileResponse,
  DbIgnoresRequest,
  DbIgnoresResponse,
  DbLocalChangedResponse,
  DbNeedResponse,
  DbRemoteNeedResponse,
  FolderStatus,
} from '../types/db'

export interface DbEndpoints {
  'GET /db/status': { query: { folder: FolderID }; response: FolderStatus }
  'GET /db/browse': {
    query: { folder: FolderID; prefix?: string; levels?: number }
    response: BrowseEntry[]
  }
  'GET /db/completion': { query?: { folder?: FolderID; device?: DeviceID }; response: Completion }
  'GET /db/file': { query: { folder: FolderID; file: string }; response: DbFileResponse }
  'GET /db/ignores': { query: { folder: FolderID }; response: DbIgnoresResponse }
  'POST /db/ignores': {
    query: { folder: FolderID }
    body: DbIgnoresRequest
    response: DbIgnoresResponse
  }
  'GET /db/localchanged': {
    query: { folder: FolderID; page?: number; perpage?: number }
    response: DbLocalChangedResponse
  }
  'GET /db/need': {
    query: { folder: FolderID; page?: number; perpage?: number }
    response: DbNeedResponse
  }
  'POST /db/override': { query: { folder: FolderID }; response: void }
  'POST /db/prio': { query: { folder: FolderID; file: string }; response: DbNeedResponse }
  'GET /db/remoteneed': {
    query: { folder: FolderID; device: DeviceID; page?: number; perpage?: number }
    response: DbRemoteNeedResponse
  }
  'POST /db/revert': { query: { folder: FolderID }; response: void }
  /** Array `sub` values are sent as repeated query keys (sub=a&sub=b). */
  'POST /db/scan': {
    query?: { folder?: FolderID; sub?: string | string[]; next?: number }
    response: void
  }
}
