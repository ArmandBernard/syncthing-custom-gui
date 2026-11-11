import { createContext } from 'preact'
import type { DeviceID } from '@lib/syncthing/types/common.ts'
import type { TransferHistoryPoint } from './useDeviceTransferHistory.ts'

export const TransferHistoryContext = createContext<
  Record<DeviceID, TransferHistoryPoint[]> | undefined
>(undefined)
