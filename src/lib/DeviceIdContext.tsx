import { createContext, type ReactNode, useContext } from 'react'
import { useSyncthingQuery } from '../hooks/useSyncthingQuery.ts'
import type { DeviceID } from './syncthing/types/common.ts'

const DeviceIDContext = createContext<DeviceID | undefined>(undefined)

export function useDeviceId(): DeviceID {
  const context = useContext(DeviceIDContext)

  if (!context) {
    throw new Error('DeviceIDContext must be defined')
  }

  return context
}

export function DeviceIDContextProvider({ children }: { children: ReactNode }) {
  const { data: status } = useSyncthingQuery('GET /system/status')

  if (!status) {
    return null
  }

  return <DeviceIDContext.Provider value={status.myID}>{children}</DeviceIDContext.Provider>
}
