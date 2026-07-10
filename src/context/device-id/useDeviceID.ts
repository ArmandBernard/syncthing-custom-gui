import type { DeviceID } from '../../lib/syncthing/types/common.ts'
import { useContext } from 'react'
import { DeviceIDContext } from './DeviceIdContext.ts'

export function useDeviceID(): DeviceID {
  const context = useContext(DeviceIDContext)

  if (!context) {
    throw new Error('DeviceIDContext must be defined')
  }

  return context
}
