import { lazy, type PropsWithChildren, Suspense } from 'react'
import type { TransferHistoryPoint } from '../context/transfer-history/useDeviceTransferHistory.ts'

const TransferChartImpl = lazy(() => import('./TransferChartImpl'))

export function TransferChart({ history }: { history: TransferHistoryPoint[] }) {
  if (history.length < 2) {
    return <LoadingContainer>Collecting transfer data&hellip;</LoadingContainer>
  }

  return (
    <div className="h-40">
      <Suspense fallback={<LoadingContainer>Loading chart&hellip;</LoadingContainer>}>
        <TransferChartImpl history={history} />
      </Suspense>
    </div>
  )
}

function LoadingContainer({ children }: PropsWithChildren) {
  return (
    <div className="flex h-40 items-center justify-center text-sm text-on-surface-variant">
      {children}
    </div>
  )
}
