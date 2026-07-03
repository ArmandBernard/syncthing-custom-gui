import type { DeviceID, FolderID, ISODateTime } from './common'

export interface PendingDevice {
  time: ISODateTime
  name: string
  address: string
}

export type PendingDevices = Record<DeviceID, PendingDevice>

export interface PendingFolderOffer {
  time: ISODateTime
  label: string
  receiveEncrypted: boolean
  remoteEncrypted: boolean
}

export interface PendingFolder {
  offeredBy: Record<DeviceID, PendingFolderOffer>
}

export type PendingFolders = Record<FolderID, PendingFolder>
