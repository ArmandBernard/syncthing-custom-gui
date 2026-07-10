import { createContext } from 'react'
import type { DeviceID } from '../../lib/syncthing/types/common.ts'

export const DeviceIDContext = createContext<DeviceID | undefined>(undefined)
