import { formatTransferRate } from '@lib/formatTransferRate.ts'
import type { TransferHistoryPoint } from '@context/transfer-history/useDeviceTransferHistory.ts'

const TRANSFERRING_THRESHOLD = 0

export function SpeedInline({ rates }: { rates: TransferHistoryPoint | undefined }) {
  if (!rates) {
    return null
  }
  return (
    <span className="text-xs self-center leading-3.5">
      <div
        aria-label={`${formatTransferRate(rates.outRate)} up`}
        className={
          'text-right ' +
          (rates.outRate > TRANSFERRING_THRESHOLD
            ? 'text-on-surface-syncing'
            : 'text-on-surface-variant')
        }
      >
        {formatTransferRate(rates.outRate)} ⭡
      </div>
      <div
        aria-label={`${formatTransferRate(rates.outRate)} down`}
        className={
          'text-right ' +
          (rates.outRate > TRANSFERRING_THRESHOLD
            ? 'text-on-surface-syncing'
            : 'text-on-surface-variant')
        }
      >
        {formatTransferRate(rates.inRate)} ⭣
      </div>
    </span>
  )
}
