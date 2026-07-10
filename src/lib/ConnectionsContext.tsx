import { createContext, type ReactNode } from 'react'
import type { SystemConnections } from './syncthing/types/system.ts'
import { useSyncthingQuery } from '../hooks/useSyncthingQuery.ts'

export const ConnectionsContext = createContext<SystemConnections | undefined>(undefined)

export function ConnectionsContextProvider({ children }: { children: ReactNode }) {
  const { data: connections } = useSyncthingQuery('GET /system/connections', {
    refetchInterval: 2000,
  })

  return <ConnectionsContext.Provider value={connections}>{children}</ConnectionsContext.Provider>
}
