import type { DeviceID } from '../common'
import type { ObservedFolder } from './common'

export type Compression = 'metadata' | 'always' | 'never'

export interface DeviceConfiguration {
  deviceID: DeviceID
  name: string
  addresses: string[]
  compression: Compression
  certName: string
  introducer: boolean
  skipIntroductionRemovals: boolean
  introducedBy: DeviceID | ''
  paused: boolean
  allowedNetworks: string[]
  autoAcceptFolders: boolean
  maxSendKbps: number
  maxRecvKbps: number
  ignoredFolders: ObservedFolder[]
  maxRequestKiB: number
  untrusted: boolean
  remoteGUIPort: number
  numConnections: number
  group: string
}
