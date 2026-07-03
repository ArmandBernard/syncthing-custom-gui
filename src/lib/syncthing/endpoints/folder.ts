import type { FolderID } from '../types/common'
import type {
  FolderErrorsResponse,
  FolderVersionsRestoreRequest,
  FolderVersionsRestoreResponse,
  FolderVersionsResponse,
} from '../types/folder'

export interface FolderEndpoints {
  'GET /folder/errors': {
    query: { folder: FolderID; page?: number; perpage?: number }
    response: FolderErrorsResponse
  }
  'GET /folder/versions': { query: { folder: FolderID }; response: FolderVersionsResponse }
  'POST /folder/versions': {
    query: { folder: FolderID }
    body: FolderVersionsRestoreRequest
    response: FolderVersionsRestoreResponse
  }
}
