import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
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
        <AreaChart data={history} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
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
            domain={[0, (dataMax: number) => Math.max(1024, dataMax)]}
            allowDataOverflow
            width={64}
          />
          <Tooltip
            wrapperClassName="rounded-md"
            labelFormatter={(time) => dayJs(Number(time)).format('HH:mm:ss')}
            formatter={(value) => formatTransferRate(Number(value))}
            contentStyle={{
              backgroundColor: 'var(--color-surface-high)',
              border: 'none',
              color: 'var(--color-on-surface)',
              fontSize: 14,
            }}
          />
          <Legend
            iconType="plainline"
            iconSize={24}
            wrapperStyle={{ color: 'var(--color-on-surface-variant)', fontSize: 12 }}
          />
          <Area
            name="Download"
            type="monotone"
            dataKey="inRate"
            stroke="var(--color-transfer-download)"
            fill="var(--color-transfer-download)"
            fillOpacity={0.2}
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            isAnimationActive={false}
          />
          <Area
            name="Upload"
            type="monotone"
            dataKey="outRate"
            stroke="var(--color-transfer-upload)"
            fill="var(--color-transfer-upload)"
            fillOpacity={0.2}
            strokeWidth={2}
            strokeDasharray="2 3"
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
