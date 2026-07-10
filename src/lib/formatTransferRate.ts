export function formatTransferRate(bytesPerSecond: number): string {
  let scale = 0
  let displayValue = bytesPerSecond

  while (displayValue > 1024) {
    displayValue = displayValue / 1024
    scale++
  }

  return `${displayValue.toFixed(1)} ${units[scale]}`
}

const units = ['B/s', 'KiB/s', 'MiB/s', 'GiB/s', 'TiB/s']
