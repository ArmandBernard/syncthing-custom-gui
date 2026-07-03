import type { ISODateTime } from '../common'

export interface EventEnvelope<TType extends string, TData> {
  id: number
  globalID: number
  time: ISODateTime
  type: TType
  data: TData
}

/** Mirrors Go's net/url.URL JSON marshalling verbatim, as seen in the
 *  ListenAddressesChanged event example — note the PascalCase field names,
 *  inconsistent with camelCase used everywhere else in the API. */
export interface SyncthingURL {
  Scheme: string
  Opaque: string
  User: unknown | null
  Host: string
  Path: string
  RawPath: string
  ForceQuery: boolean
  RawQuery: string
  Fragment: string
}
