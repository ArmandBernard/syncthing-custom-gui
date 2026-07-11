import { useSyncthingQuery } from '@hooks/useSyncthingQuery.ts'

export function useCreateFolderId() {
  const { data } = useSyncthingQuery('GET /svc/random/string', { query: { length: 10 } })

  if (!data) {
    return null
  }

  return (data.random.substring(0, 5) + '-' + data.random.substring(5, 5)).toLowerCase()
}
