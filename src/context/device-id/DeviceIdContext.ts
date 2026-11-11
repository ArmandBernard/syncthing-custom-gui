import { createContext } from 'preact'
import type { DeviceID } from '@lib/syncthing/types/common.ts'

export const DeviceIDContext = createContext<DeviceID | undefined>(undefined)
