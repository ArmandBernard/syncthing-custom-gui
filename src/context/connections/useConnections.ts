import { useContext } from 'react'
import { ConnectionsContext } from './ConnectionsContext.ts'

export function useConnections() {
  return useContext(ConnectionsContext)
}
