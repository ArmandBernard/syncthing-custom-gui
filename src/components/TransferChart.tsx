import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import dayJs from '../lib/dayJs'
import type { TransferHistoryPoint } from '../hooks/useDeviceTransferHistory.ts'
import { formatTransferRate } from '../lib/formatTransferRate.ts'

export function TransferChart({ history }: { history: TransferHistoryPoint[] }) {
  if (history.length < 2) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-on-surface-variant">
        Collecting transfer data&hellip;
      </div>
    )
  }

  const nowUnix = Date.now()

  return (
    <div className="h-40">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={history} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="var(--color-outline-variant)" vertical={false} />
          <XAxis
            dataKey="time"
            type="number"
            domain={[nowUnix - 60 * 1000, nowUnix]}
            allowDataOverflow
            stroke="var(--color-outline-variant)"
            hide={true}
            minTickGap={32}
          />
          <YAxis
            tickFormatter={(rate: number) => formatTransferRate(rate)}
            stroke="var(--color-outline-variant)"
            tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 12 }}
            width={64}
          />
          <Tooltip
            labelFormatter={(time) => dayJs(Number(time)).format('HH:mm:ss')}
            formatter={(value) => formatTransferRate(Number(value))}
            contentStyle={{
              backgroundColor: 'var(--color-surface-high)',
              borderColor: 'var(--color-outline-variant)',
              color: 'var(--color-on-surface)',
            }}
          />
          <Legend wrapperStyle={{ color: 'var(--color-on-surface-variant)', fontSize: 12 }} />
          <Line
            name="Download"
            type="monotone"
            dataKey="inRate"
            stroke="var(--color-transfer-download)"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            isAnimationActive={false}
          />
          <Line
            name="Upload"
            type="monotone"
            dataKey="outRate"
            stroke="var(--color-transfer-upload)"
            strokeWidth={2}
            strokeDasharray="2 3"
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
