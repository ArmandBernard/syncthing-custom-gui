import { createContext } from 'react'
import type { DeviceID } from '../../lib/syncthing/types/common.ts'
import type { TransferHistoryPoint } from './TransferHistoryContextProvider.tsx'

export const TransferHistoryContext = createContext<
  Record<DeviceID, TransferHistoryPoint[]> | undefined
>(undefined)
