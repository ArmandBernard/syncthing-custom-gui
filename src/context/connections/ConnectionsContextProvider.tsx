import type { ReactNode } from 'react'
import { useSyncthingQuery } from '../../hooks/useSyncthingQuery.ts'
import { ConnectionsContext } from './ConnectionsContext.ts'

export function ConnectionsContextProvider({ children }: { children: ReactNode }) {
  const { data: connections } = useSyncthingQuery('GET /system/connections', {
    refetchInterval: 2000,
  })

  return <ConnectionsContext.Provider value={connections}>{children}</ConnectionsContext.Provider>
}
