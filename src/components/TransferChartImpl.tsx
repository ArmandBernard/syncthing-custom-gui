import { useMemo } from 'react'
import { ParentSize } from '@visx/responsive'
import { scaleLinear } from '@visx/scale'
import { AreaClosed } from '@visx/shape'
import { curveMonotoneX } from '@visx/curve'
import { GridRows } from '@visx/grid'
import { AxisLeft } from '@visx/axis'
import { useTooltip, TooltipWithBounds, defaultStyles } from '@visx/tooltip'
import { localPoint } from '@visx/event'
import type { TransferHistoryPoint } from '../context/transfer-history/useDeviceTransferHistory.ts'
import { formatTransferRate } from '../lib/formatTransferRate.ts'

const margin = { top: 4, right: 8, bottom: 4, left: 56 }

const tooltipStyles = {
  ...defaultStyles,
  backgroundColor: 'var(--color-surface-high)',
  color: 'var(--color-on-surface)',
  border: 'none',
  fontSize: 14,
  borderRadius: 6,
}

function findNearest(history: TransferHistoryPoint[], time: number): TransferHistoryPoint {
  return history.reduce((closest, point) =>
    Math.abs(point.time - time) < Math.abs(closest.time - time) ? point : closest,
  )
}

export default function TransferChartImpl({ history }: { history: TransferHistoryPoint[] }) {
  const nowUnix = Date.now()

  const dataMax = useMemo(
    () => history.reduce((max, point) => Math.max(max, point.inRate, point.outRate), 0),
    [history],
  )

  const { tooltipData, tooltipLeft, tooltipTop, tooltipOpen, showTooltip, hideTooltip } =
    useTooltip<TransferHistoryPoint>()

  return (
    <div className="flex h-full w-full flex-col gap-1">
      <div className="relative min-h-0 flex-1">
        <ParentSize>
          {({ width, height }) => {
            if (width === 0 || height === 0) return null

            const xScale = scaleLinear({
              domain: [nowUnix - 60 * 1000, nowUnix],
              range: [margin.left, width - margin.right],
            })
            const yScale = scaleLinear({
              domain: [0, Math.max(1024, dataMax)],
              range: [height - margin.bottom, margin.top],
            })

            const handlePointerMove = (event: React.PointerEvent<SVGRectElement>) => {
              if (history.length === 0) return
              const point = localPoint(event)
              if (!point) return
              const nearest = findNearest(history, xScale.invert(point.x))
              showTooltip({ tooltipData: nearest, tooltipLeft: point.x, tooltipTop: point.y })
            }

            return (
              <svg width={width} height={height}>
                <GridRows
                  scale={yScale}
                  width={Math.max(0, width - margin.left - margin.right)}
                  left={margin.left}
                  numTicks={4}
                  stroke="var(--color-outline-variant)"
                />
                <AreaClosed
                  data={history}
                  x={(d) => xScale(d.time)}
                  y={(d) => yScale(d.inRate)}
                  yScale={yScale}
                  curve={curveMonotoneX}
                  fill="var(--color-transfer-download)"
                  fillOpacity={0.2}
                  stroke="var(--color-transfer-download)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
                <AreaClosed
                  data={history}
                  x={(d) => xScale(d.time)}
                  y={(d) => yScale(d.outRate)}
                  yScale={yScale}
                  curve={curveMonotoneX}
                  fill="var(--color-transfer-upload)"
                  fillOpacity={0.2}
                  stroke="var(--color-transfer-upload)"
                  strokeWidth={2}
                  strokeDasharray="2 3"
                />
                <AxisLeft
                  scale={yScale}
                  left={margin.left}
                  numTicks={4}
                  hideAxisLine
                  hideTicks
                  tickFormat={(value) => formatTransferRate(Number(value))}
                  tickLabelProps={() => ({
                    fill: 'var(--color-on-surface-variant)',
                    fontSize: 12,
                    textAnchor: 'end',
                    dy: '0.33em',
                  })}
                />
                <rect
                  x={margin.left}
                  y={margin.top}
                  width={Math.max(0, width - margin.left - margin.right)}
                  height={Math.max(0, height - margin.top - margin.bottom)}
                  fill="transparent"
                  onPointerMove={handlePointerMove}
                  onPointerLeave={hideTooltip}
                />
              </svg>
            )
          }}
        </ParentSize>

        {tooltipOpen && tooltipData && (
          <TooltipWithBounds left={tooltipLeft} top={tooltipTop} style={tooltipStyles}>
            <div className="font-medium">{new Date(tooltipData.time).toLocaleTimeString()}</div>
            <div>Download: {formatTransferRate(tooltipData.inRate)}</div>
            <div>Upload: {formatTransferRate(tooltipData.outRate)}</div>
          </TooltipWithBounds>
        )}
      </div>

      <div className="flex items-center justify-center gap-4 text-xs text-on-surface-variant">
        <LegendItem color="var(--color-transfer-download)" dash="5 5" label="Download" />
        <LegendItem color="var(--color-transfer-upload)" dash="2 3" label="Upload" />
      </div>
    </div>
  )
}

function LegendItem({ color, dash, label }: { color: string; dash: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <svg width={20} height={8}>
        <line x1={0} y1={4} x2={20} y2={4} stroke={color} strokeWidth={2} strokeDasharray={dash} />
      </svg>
      <span>{label}</span>
    </div>
  )
}
