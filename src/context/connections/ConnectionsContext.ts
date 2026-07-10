import { createContext } from 'react'
import type { SystemConnections } from '../../lib/syncthing/types/system.ts'

export const ConnectionsContext = createContext<SystemConnections | undefined>(undefined)
