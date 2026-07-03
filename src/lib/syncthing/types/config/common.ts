import type { DeviceID, ISODateTime } from '../common'

/** Used for minDiskFree / minHomeDiskFree. Unit is a free-form string in the
 *  Go source; "%", "kB", "MB", "GB", "TB" are the conventional GUI values,
 *  but the field is not a closed enum. */
export interface Size {
  value: number
  unit: '%' | 'kB' | 'MB' | 'GB' | 'TB' | (string & {})
}

/** An entry in DeviceConfiguration.ignoredFolders */
export interface ObservedFolder {
  time: ISODateTime
  id: string
  label: string
}

/** An entry in Configuration.remoteIgnoredDevices */
export interface ObservedDevice {
  time: ISODateTime
  deviceID: DeviceID
  name: string
  address: string
}
