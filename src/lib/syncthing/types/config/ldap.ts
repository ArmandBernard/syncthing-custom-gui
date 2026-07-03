export type LDAPTransport = 'plain' | 'tls' | 'starttls'

export interface LDAPConfiguration {
  address: string
  bindDN: string
  transport: LDAPTransport
  insecureSkipVerify: boolean
  searchBaseDN: string
  searchFilter: string
}
