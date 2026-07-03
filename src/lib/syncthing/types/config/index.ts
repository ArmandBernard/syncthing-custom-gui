import type { FolderConfiguration } from './folder'
import type { DeviceConfiguration } from './device'
import type { GUIConfiguration } from './gui'
import type { LDAPConfiguration } from './ldap'
import type { OptionsConfiguration } from './options'
import type { ObservedDevice } from './common'

export * from './common'
export * from './folder'
export * from './device'
export * from './gui'
export * from './ldap'
export * from './options'

export interface Ignores {
  lines: string[]
}

export interface Defaults {
  folder: FolderConfiguration
  device: DeviceConfiguration
  ignores: Ignores
}

export interface Configuration {
  version: number
  folders: FolderConfiguration[]
  devices: DeviceConfiguration[]
  gui: GUIConfiguration
  ldap: LDAPConfiguration
  options: OptionsConfiguration
  remoteIgnoredDevices: ObservedDevice[]
  defaults: Defaults
}
