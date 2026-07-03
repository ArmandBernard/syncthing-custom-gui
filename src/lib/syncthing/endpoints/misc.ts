import type { SvcDeviceId, SvcLang, SvcRandomString, SvcReport } from '../types/misc'

export interface MiscEndpoints {
  'GET /svc/deviceid': { query: { id: string }; response: SvcDeviceId }
  'GET /svc/lang': { response: SvcLang }
  'GET /svc/random/string': { query?: { length?: number }; response: SvcRandomString }
  'GET /svc/report': { response: SvcReport }
}
