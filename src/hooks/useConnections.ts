import { useContext } from 'react'
import { ConnectionsContext } from '../lib/ConnectionsContext.tsx'

export function useConnections() {
  return useContext(ConnectionsContext)
}
