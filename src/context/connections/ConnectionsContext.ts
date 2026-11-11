import { createContext } from 'preact'
import type { SystemConnections } from '@lib/syncthing/types/system.ts'

export const ConnectionsContext = createContext<SystemConnections | undefined>(undefined)
