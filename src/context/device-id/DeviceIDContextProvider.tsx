import type { ComponentChildren } from 'preact'
import { useSyncthingQuery } from '@hooks/useSyncthingQuery.ts'
import { DeviceIDContext } from './DeviceIdContext.ts'

export function DeviceIDContextProvider({ children }: { children: ComponentChildren }) {
  const { data: status } = useSyncthingQuery('GET /system/status')

  if (!status) {
    return null
  }

  return <DeviceIDContext.Provider value={status.myID}>{children}</DeviceIDContext.Provider>
}
