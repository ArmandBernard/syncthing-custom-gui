export function ByteSize({ bytes }: { bytes: number }) {
  let scale = 0
  let displayValue = bytes

  while (displayValue > 1024) {
    displayValue = displayValue / 1024
    scale++
  }

  return `${displayValue.toFixed(1)} ${units[scale]}`
}

const units = ['B', 'KiB', 'MiB', 'GiB', 'TiB']
