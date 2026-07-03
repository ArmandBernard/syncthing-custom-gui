import type { DeviceID, FolderID, ISODateTime } from './common'

export interface DeviceStats {
  lastSeen: ISODateTime
  lastConnectionDurationS: number
}

export type StatsDevice = Record<DeviceID, DeviceStats>

export interface FolderStatsLastFile {
  filename: string
  at: ISODateTime
}

export interface FolderStats {
  lastScan: ISODateTime
  lastFile: FolderStatsLastFile
}

export type StatsFolder = Record<FolderID, FolderStats>
