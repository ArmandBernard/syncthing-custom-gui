import type { Size } from './common'

export interface OptionsConfiguration {
  listenAddresses: string[]
  globalAnnounceServers: string[]
  globalAnnounceEnabled: boolean
  localAnnounceEnabled: boolean
  localAnnouncePort: number
  localAnnounceMCAddr: string
  maxSendKbps: number
  maxRecvKbps: number
  reconnectionIntervalS: number
  relaysEnabled: boolean
  relayReconnectIntervalM: number
  startBrowser: boolean
  natEnabled: boolean
  natLeaseMinutes: number
  natRenewalMinutes: number
  natTimeoutSeconds: number
  urAccepted: number
  urSeen: number
  urUniqueId: string
  urURL: string
  urPostInsecurely: boolean
  urInitialDelayS: number
  autoUpgradeIntervalH: number
  upgradeToPreReleases: boolean
  keepTemporariesH: number
  cacheIgnoredFiles: boolean
  progressUpdateIntervalS: number
  limitBandwidthInLan: boolean
  minHomeDiskFree: Size
  releasesURL: string
  alwaysLocalNets: string[]
  overwriteRemoteDeviceNamesOnConnect: boolean
  tempIndexMinBlocks: number
  unackedNotificationIDs: string[]
  trafficClass: number
  setLowPriority: boolean
  maxFolderConcurrency: number
  /** JSON tag is the abbreviation "crURL", not "crashReportingURL". */
  crURL: string
  crashReportingEnabled: boolean
  stunKeepaliveStartS: number
  stunKeepaliveMinS: number
  stunServers: string[]
  maxConcurrentIncomingRequestKiB: number
  announceLANAddresses: boolean
  sendFullIndexOnUpgrade: boolean
  /** Free-form flag names, no fixed/documented list. */
  featureFlags: string[]
  auditEnabled: boolean
  auditFile: string
  connectionLimitEnough: number
  connectionLimitMax: number
  /** New in main, not yet in the rendered docs (all six connectionPriority* fields). */
  connectionPriorityTcpLan?: number
  connectionPriorityQuicLan?: number
  connectionPriorityTcpWan?: number
  connectionPriorityQuicWan?: number
  connectionPriorityRelay?: number
  connectionPriorityUpgradeThreshold?: number
}
