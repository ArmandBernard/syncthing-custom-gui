export interface SvcDeviceIdSuccess {
  id: string
}
export interface SvcDeviceIdError {
  error: string
}
export type SvcDeviceId = SvcDeviceIdSuccess | SvcDeviceIdError

export type SvcLang = string[]

export interface SvcRandomString {
  random: string
}

/** Best-guess/partial: the usage-report schema evolves with `urVersion` and isn't
 *  published as a closed schema upstream. Treat unlisted fields as possible. */
export interface SvcReport {
  folderMaxMiB: number
  platform: string
  totMiB: number
  longVersion: string
  upgradeAllowedManual: boolean
  totFiles: number
  folderUses: {
    ignorePerms: number
    autoNormalize: number
    sendonly: number
    ignoreDelete: number
  }
  memoryUsageMiB: number
  version: string
  sha256Perf: number
  numFolders: number
  memorySize: number
  announce: {
    defaultServersIP: number
    otherServers: number
    globalEnabled: boolean
    defaultServersDNS: number
    localEnabled: boolean
  }
  usesRateLimit: boolean
  numCPU: number
  uniqueID: string
  urVersion: number
  rescanIntvs: number[]
  numDevices: number
  folderMaxFiles: number
  relays: {
    defaultServers: number
    enabled: boolean
    otherServers: number
  }
  deviceUses: {
    compressMetadata: number
    customCertName: number
    staticAddr: number
    compressAlways: number
    compressNever: number
    introducer: number
    dynamicAddr: number
  }
  upgradeAllowedAuto: boolean
  [key: string]: unknown
}
