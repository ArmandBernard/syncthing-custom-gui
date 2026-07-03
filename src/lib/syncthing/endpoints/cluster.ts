import type { PendingDevices, PendingFolders } from '../types/cluster'

export interface ClusterEndpoints {
  'GET /cluster/pending/devices': { response: PendingDevices }
  'DELETE /cluster/pending/devices': { query: { device: string }; response: void }
  'GET /cluster/pending/folders': { query?: { device?: string }; response: PendingFolders }
  'DELETE /cluster/pending/folders': { query: { folder: string; device?: string }; response: void }
}
