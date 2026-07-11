import { createContext } from 'react'
import type { DeviceID } from '@lib/syncthing/types/common.ts'
import type { TransferHistoryPoint } from './useDeviceTransferHistory.ts'

export const TransferHistoryContext = createContext<
  Record<DeviceID, TransferHistoryPoint[]> | undefined
>(undefined)
