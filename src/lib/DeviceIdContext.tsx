import { createContext, type ReactNode } from 'react'
import { useSyncthingQuery } from '../hooks/useSyncthingQuery.ts'
import type { DeviceID } from './syncthing/types/common.ts'

export const DeviceIDContext = createContext<DeviceID | undefined>(undefined)

export function DeviceIDContextProvider({ children }: { children: ReactNode }) {
  const { data: status } = useSyncthingQuery('GET /system/status')

  if (!status) {
    return null
  }

  return <DeviceIDContext.Provider value={status.myID}>{children}</DeviceIDContext.Provider>
}
