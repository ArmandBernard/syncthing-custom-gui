import type { StatsDevice, StatsFolder } from '../types/stats'

export interface StatsEndpoints {
  'GET /stats/device': { response: StatsDevice }
  'GET /stats/folder': { response: StatsFolder }
}
