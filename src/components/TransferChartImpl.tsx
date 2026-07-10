import type { TransferHistoryPoint } from '../context/transfer-history/useDeviceTransferHistory.ts'
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
import { formatTransferRate } from '../lib/formatTransferRate.ts'

export default function TransferChartImpl({ history }: { history: TransferHistoryPoint[] }) {
  const nowUnix = Date.now()

  return (
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
          labelFormatter={(time) => new Date(time).toLocaleTimeString()}
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
  )
}
