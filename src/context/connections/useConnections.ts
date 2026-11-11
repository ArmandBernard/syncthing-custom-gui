import { useContext } from 'preact/hooks'
import { ConnectionsContext } from './ConnectionsContext.ts'

export function useConnections() {
  return useContext(ConnectionsContext)
}
