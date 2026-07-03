import type {
  NoAuthHealth,
  Ping,
  SystemConnections,
  SystemDiscoveryCache,
  SystemErrors,
  SystemLog,
  SystemLogLevels,
  SystemPaths,
  SystemStatus,
  SystemUpgrade,
  SystemVersion,
  LogLevel,
} from '../types/system'

export interface SystemEndpoints {
  'GET /system/ping': { response: Ping }
  'POST /system/ping': { response: Ping }
  'GET /system/status': { response: SystemStatus }
  'GET /system/connections': { response: SystemConnections }
  'GET /system/discovery': { response: SystemDiscoveryCache }
  /** Docs are self-contradictory: the page's own body says "Removed in v0.12.0" yet
   *  the endpoint is still listed with a live-looking example. Unverified — confirm
   *  against a live server before relying on it. */
  'POST /system/discovery': { query: { device: string; addr: string }; response: void }
  'GET /system/error': { response: SystemErrors }
  /** Plain-text body, not JSON. */
  'POST /system/error': { body: string; response: void }
  'POST /system/error/clear': { response: void }
  'GET /system/log': { query?: { since?: string }; response: SystemLog }
  /** Plain text, not JSON. */
  'GET /system/log.txt': { response: string }
  'GET /system/loglevels': { response: SystemLogLevels }
  'POST /system/loglevels': { body: Record<string, LogLevel>; response: void }
  'GET /system/paths': { response: SystemPaths }
  'POST /system/pause': { query?: { device?: string }; response: void }
  'POST /system/resume': { query?: { device?: string }; response: void }
  'POST /system/restart': { response: void }
  'POST /system/reset': { query?: { folder?: string }; response: void }
  'POST /system/shutdown': { response: void }
  'GET /system/upgrade': { response: SystemUpgrade }
  'POST /system/upgrade': { response: void }
  'GET /system/version': { response: SystemVersion }
  'GET /noauth/health': { response: NoAuthHealth }
}
