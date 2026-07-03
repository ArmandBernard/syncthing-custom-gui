import type { DeviceID, FolderID } from '../common'
import type { FolderFileError } from '../folder'
import type { Completion, FolderState, FolderStatus } from '../db'
import type { Configuration } from '../config'
import type { SyncthingURL } from './envelope'

export interface ClusterConfigReceivedData {
  device: DeviceID
}

/** Full runtime config snapshot, same shape as GET /config. */
export type ConfigSavedData = Configuration

export interface DeviceConnectedData {
  id: DeviceID
  addr: string
  deviceName: string
  clientName: string
  clientVersion: string
  /** e.g. "TCP (Client)" / "TCP (Server)" — free-form string per docs, not an enum */
  type: string
}

export interface DeviceDisconnectedData {
  id: DeviceID
  error: string
}

export interface DeviceDiscoveredData {
  device: DeviceID
  addrs: string[]
}

export interface DevicePausedData {
  device: DeviceID
}

/** @deprecated since v1.13.0 — superseded by PendingDevicesChanged; still emitted for compat. */
export interface DeviceRejectedData {
  device: DeviceID
  address: string
  name: string
}

export interface DeviceResumedData {
  device: DeviceID
}

export interface DownloadProgressFileState {
  total: number
  pulling: number
  copiedFromOrigin: number
  reused: number
  copiedFromElsewhere: number
  pulled: number
  bytesTotal: number
  bytesDone: number
}

/** folder -> filename -> progress */
export type DownloadProgressData = Record<FolderID, Record<string, DownloadProgressFileState>>

/** Unlike every other event, `data` here is a bare string, not an object. */
export type FailureData = string

export type FolderCompletionData = Completion & { device: DeviceID; folder: FolderID }

export interface FolderErrorsData {
  folder: FolderID
  errors: FolderFileError[]
}

export interface FolderPausedData {
  id: FolderID
  label: string
}

/** @deprecated since v1.13.0 — superseded by PendingFoldersChanged; still emitted for compat. */
export interface FolderRejectedData {
  device: DeviceID
  folder: FolderID
  folderLabel: string
}

export interface FolderResumedData {
  id: FolderID
  label: string
}

export interface FolderScanProgressData {
  folder: FolderID
  current: number
  total: number
  rate: number
}

export interface FolderSummaryData {
  folder: FolderID
  summary: FolderStatus
}

export interface FolderWatchStateChangedData {
  folder: FolderID
  from?: string
  to?: string
}

/** Docs show only "file" as an example value for `type`; "dir"/"symlink" are
 *  inferred by analogy with FileInfoType, not directly confirmed. */
export type ItemKind = 'file' | 'dir' | 'symlink'
export type ItemAction = 'update' | 'metadata' | 'delete'

export interface ItemStartedData {
  item: string
  folder: FolderID
  type: ItemKind
  action: ItemAction
}

export interface ItemFinishedData {
  item: string
  folder: FolderID
  error: string | null
  type: ItemKind
  action: ItemAction
}

export interface ListenAddressesChangedData {
  address: SyncthingURL
  wan: SyncthingURL[]
  lan: SyncthingURL[]
}

export interface LocalChangeDetectedData {
  action: string
  folder: FolderID
  /** @deprecated since v1.1.2, use `folder` */
  folderID: FolderID
  label: string
  path: string
  type: string
}

export interface LocalIndexUpdatedData {
  folder: FolderID
  items: number
  filenames: string[]
  sequence: number
  /** @deprecated identical to `sequence` */
  version: number
}

export interface LoginAttemptData {
  remoteAddress: string
  username: string
  success: boolean
  proxy?: string
}

export interface PendingDeviceAdded {
  address: string
  deviceID: DeviceID
  name: string
}
export interface PendingDeviceRemoved {
  deviceID: DeviceID
}
export interface PendingDevicesChangedData {
  added?: PendingDeviceAdded[]
  removed?: PendingDeviceRemoved[]
}

export interface PendingFolderAdded {
  deviceID: DeviceID
  folderID: FolderID
  folderLabel: string
  receiveEncrypted: boolean
  remoteEncrypted: boolean
}
export interface PendingFolderRemoved {
  deviceID?: DeviceID
  folderID: FolderID
}
export interface PendingFoldersChangedData {
  added?: PendingFolderAdded[]
  removed?: PendingFolderRemoved[]
}

export interface RemoteChangeDetectedData {
  type: string
  action: string
  folder: FolderID
  /** @deprecated since v1.1.2, use `folder` */
  folderID: FolderID
  path: string
  label: string
  modifiedBy: DeviceID
}

export interface RemoteDownloadProgressData {
  device: DeviceID
  folder: FolderID
  state: Record<string, number>
}

export interface RemoteIndexUpdatedData {
  device: DeviceID
  folder: FolderID
  items: number
}

export interface StartingData {
  home: string
}

export type StartupCompleteData = null

export interface StateChangedData {
  folder: FolderID
  from: FolderState
  to: FolderState
  duration: number
}
