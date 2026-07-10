import { formatBytes } from './formatBytes.ts'

export function formatTransferRate(bytesPerSecond: number): string {
  return formatBytes(bytesPerSecond) + '/s'
}
