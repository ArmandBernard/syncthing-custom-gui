import { useSyncthingQuery } from '@hooks/useSyncthingQuery.ts'
import type { FolderID } from '@lib/syncthing/types/common.ts'

export function useCreateFolderId(): FolderID | null {
  const { data } = useSyncthingQuery('GET /svc/random/string', { query: { length: 10 } })

  if (!data) {
    return null
  }

  return (data.random.substring(0, 5) + '-' + data.random.substring(5)).toLowerCase() as FolderID
}
