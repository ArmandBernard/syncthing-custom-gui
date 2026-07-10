import { useContext } from 'react'
import type { DeviceID } from '../lib/syncthing/types/common'
import { TransferHistoryContext } from '../lib/TransferHistoryContext.tsx'

export function useDeviceTransferHistory(deviceID: DeviceID) {
  const transferHistory = useContext(TransferHistoryContext)

  return transferHistory ? transferHistory[deviceID] : undefined
}
