import { createContext, type ReactNode, useContext } from 'react'
import type { SystemConnections } from './syncthing/types/system.ts'
import { useSyncthingQuery } from '../hooks/useSyncthingQuery.ts'

const ConnectionsContext = createContext<SystemConnections | undefined>(undefined)

export function useConnections() {
  return useContext(ConnectionsContext)
}

export function ConnectionsContextProvider({ children }: { children: ReactNode }) {
  const { data: connections } = useSyncthingQuery('GET /system/connections', {
    refetchInterval: 2000,
  })

  return <ConnectionsContext.Provider value={connections}>{children}</ConnectionsContext.Provider>
}
