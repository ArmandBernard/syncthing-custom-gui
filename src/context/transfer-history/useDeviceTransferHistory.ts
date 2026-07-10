import { useContext } from 'react'
import type { DeviceID } from '../../lib/syncthing/types/common.ts'
import { TransferHistoryContext } from './TransferHistoryContext.ts'

export interface TransferHistoryPoint {
  time: number
  inRate: number
  outRate: number
}

export function useDeviceTransferHistory(deviceID: DeviceID) {
  const transferHistory = useContext(TransferHistoryContext)

  return transferHistory ? transferHistory[deviceID] : undefined
}
