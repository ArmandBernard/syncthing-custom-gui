import type { DeviceID, ISODateTime } from './common'

export interface Ping {
  ping: 'pong'
}

export interface ConnectionServiceStatus {
  error: string | null
  lanAddresses: string[]
  wanAddresses: string[]
}

export interface DiscoveryStatusEntry {
  error: string | null
}

export interface LastDialStatusEntry {
  when: ISODateTime
  ok?: boolean
  error?: string
}

export interface SystemStatus {
  alloc: number
  connectionServiceStatus: Record<string, ConnectionServiceStatus>
  /** Deprecated by upstream; always reports 0. */
  cpuPercent: number
  discoveryEnabled: boolean
  /** @deprecated Superseded by discoveryStatus (lists only failed methods, string->string error map). */
  discoveryErrors?: Record<string, string>
  discoveryStatus: Record<string, DiscoveryStatusEntry>
  discoveryMethods: number
  goroutines: number
  lastDialStatus: Record<DeviceID, LastDialStatusEntry>
  myID: DeviceID
  pathSeparator: string
  startTime: ISODateTime
  sys: number
  themes: string[]
  tilde: string
  uptime: number // seconds
}

export type ConnectionType =
  'tcp-client' | 'tcp-server' | 'relay-client' | 'relay-server' | 'quic-client' | 'quic-server' | ''

export interface Connection {
  address: string
  at: ISODateTime
  clientVersion: string
  connected: boolean
  inBytesTotal: number
  outBytesTotal: number
  isLocal: boolean
  /**
   * This means paused on this devices' side
   */
  paused: boolean
  startedAt: ISODateTime
  type: ConnectionType
}

export interface ConnectionsTotal {
  at: ISODateTime
  inBytesTotal: number
  outBytesTotal: number
}

export interface SystemConnections {
  connections: Record<DeviceID, Connection>
  total: ConnectionsTotal
}

/** Maps device ID -> array of known addresses in the local discovery cache. */
export type SystemDiscoveryCache = Record<DeviceID, string[]>

export interface SystemError {
  when: ISODateTime
  message: string
}

export interface SystemErrors {
  errors: SystemError[] | null
}

export interface LogEntry {
  when: ISODateTime
  message: string
}

export interface SystemLog {
  messages: LogEntry[] | null
}

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'

export interface SystemLogLevels {
  levels: Record<string, LogLevel>
  packages: Record<string, string>
}

/** Field set isn't a closed schema upstream — new path keys can appear across versions. */
export interface SystemPaths {
  auditLog: string
  'baseDir-config': string
  'baseDir-data': string
  'baseDir-userHome': string
  certFile: string
  config: string
  csrfTokens: string
  database: string
  defFolder: string
  guiAssets: string
  httpsCertFile: string
  httpsKeyFile: string
  keyFile: string
  logFile: string
  panicLog: string
  [key: string]: string
}

export interface SystemUpgrade {
  latest: string
  majorNewer: boolean
  newer: boolean
  running: string
}

export interface SystemVersion {
  arch: string
  longVersion: string
  os: string
  version: string
}

export interface NoAuthHealth {
  status: 'OK'
}
