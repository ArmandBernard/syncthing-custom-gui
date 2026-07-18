import type { SystemEndpoints } from './endpoints/system'
import type { ClusterEndpoints } from './endpoints/cluster'
import type { StatsEndpoints } from './endpoints/stats'
import type { MiscEndpoints } from './endpoints/misc'
import type { DebugEndpoints } from './endpoints/debug'
import type { DbEndpoints } from './endpoints/db'
import type { FolderEndpoints } from './endpoints/folder'
import type { EventEndpoints } from './endpoints/events'
import type { ConfigEndpoints } from './endpoints/config'
import type { AuthEndpoints } from './endpoints/auth'

export type EndpointMap = SystemEndpoints &
  ClusterEndpoints &
  StatsEndpoints &
  MiscEndpoints &
  DebugEndpoints &
  DbEndpoints &
  FolderEndpoints &
  EventEndpoints &
  ConfigEndpoints &
  AuthEndpoints
