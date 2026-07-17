import { useId, useMemo } from 'react'
import type { TargetedPointerEvent } from 'preact'
import { ParentSize } from '@visx/responsive'
import { scaleLinear } from '@visx/scale'
import { AreaClosed } from '@visx/shape'
import { curveMonotoneX } from '@visx/curve'
import { GridRows } from '@visx/grid'
import { AxisLeft } from '@visx/axis'
import { useTooltip, TooltipWithBounds, defaultStyles } from '@visx/tooltip'
import { localPoint } from '@visx/event'
import type { TransferHistoryPoint } from '@context/transfer-history/useDeviceTransferHistory.ts'
import { formatTransferRate } from '@lib/formatTransferRate.ts'

const margin = { top: 4, right: 8, bottom: 4, left: 72 }
const NUM_TICKS = 4
const STROKE_WIDTH = 2

type LineOptions = {
  label: string
  color: string
  field: keyof TransferHistoryPoint
  strokeDasharray: string
}

const lines: LineOptions[] = [
  {
    label: 'Download',
    field: 'inRate',
    color: 'var(--color-transfer-download)',
    strokeDasharray: '5 5',
  },
  {
    label: 'Upload',
    field: 'outRate',
    color: 'var(--color-transfer-upload)',
    strokeDasharray: '2 3',
  },
]

export default function TransferChartImpl({ history }: { history: TransferHistoryPoint[] }) {
  const nowUnix = Date.now()
  const clipId = useId()

  const dataMax = useMemo(() => {
    const visible = history.filter((point) => point.time >= nowUnix - 60 * 1000)
    return visible.reduce((max, point) => Math.max(max, point.inRate, point.outRate), 0)
  }, [history, nowUnix])

  const { tooltipData, tooltipLeft, tooltipTop, tooltipOpen, showTooltip, hideTooltip } =
    useTooltip<TransferHistoryPoint>()

  return (
    <div className="flex h-full w-full flex-col gap-1">
      <div className="relative min-h-0 flex-1">
        <ParentSize>
          {({ width, height }) => {
            if (width === 0 || height === 0) {
              return null
            }
            const lastPoint = history.at(-1)!
            const renderedPoints = [...history, { ...lastPoint, time: nowUnix }]

            const xScale = scaleLinear({
              domain: [nowUnix - 60 * 1000, nowUnix],
              range: [margin.left, width - margin.right],
            })
            const yScale = scaleLinear({
              domain: [0, Math.max(1024, dataMax)],
              range: [height - margin.bottom, margin.top],
            })

            function handlePointerMove(event: TargetedPointerEvent<SVGRectElement>) {
              const point = localPoint(event)
              if (history.length === 0 || !point) {
                return
              }
              const nearest = findNearest(history, xScale.invert(point.x))
              showTooltip({ tooltipData: nearest, tooltipLeft: point.x, tooltipTop: point.y })
            }
            const internalWidth = Math.max(0, width - margin.left - margin.right)
            const internalHeight = Math.max(0, height - margin.top - margin.bottom)

            return (
              <svg width={width} height={height}>
                <GridRows
                  scale={yScale}
                  width={internalWidth}
                  left={margin.left}
                  numTicks={NUM_TICKS}
                  stroke="var(--color-outline-variant)"
                />
                <clipPath id={clipId}>
                  <rect
                    x={margin.left}
                    y={margin.top}
                    width={internalWidth}
                    height={internalHeight}
                  />
                </clipPath>
                <g clipPath={`url(#${clipId})`}>
                  {lines.map((line) => (
                    <AreaClosed
                      key={line.field}
                      data={renderedPoints}
                      x={(d) => xScale(d.time)}
                      y={(d) => yScale(d[line.field])}
                      yScale={yScale}
                      curve={curveMonotoneX}
                      fill={line.color}
                      fillOpacity={0.2}
                      stroke={line.color}
                      strokeWidth={STROKE_WIDTH}
                      strokeDasharray={line.strokeDasharray}
                    />
                  ))}
                </g>
                <AxisLeft
                  scale={yScale}
                  left={margin.left}
                  numTicks={NUM_TICKS}
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
                  width={internalWidth}
                  height={internalHeight}
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
            {lines.map((line) => (
              <div key={line.field} style={{ color: line.color }}>
                {line.label}: {formatTransferRate(tooltipData[line.field])}
              </div>
            ))}
          </TooltipWithBounds>
        )}
      </div>

      <div className="flex items-center justify-center gap-4 text-xs text-on-surface-variant">
        {lines.map((line) => (
          <LegendItem key={line.field} {...line} />
        ))}
      </div>
    </div>
  )
}

function findNearest(history: TransferHistoryPoint[], time: number): TransferHistoryPoint {
  return history.reduce((closest, point) =>
    Math.abs(point.time - time) < Math.abs(closest.time - time) ? point : closest,
  )
}

const tooltipStyles = {
  ...defaultStyles,
  backgroundColor: 'var(--color-surface-high)',
  color: 'var(--color-on-surface)',
  border: 'none',
  fontSize: 14,
  borderRadius: 6,
}

function LegendItem({
  color,
  strokeDasharray,
  label,
}: {
  color: string
  strokeDasharray: string
  label: string
}) {
  return (
    <div className="flex items-center gap-1">
      <svg width={20} height={8}>
        <line
          x1={0}
          y1={4}
          x2={20}
          y2={4}
          stroke={color}
          strokeWidth={STROKE_WIDTH}
          strokeDasharray={strokeDasharray}
        />
      </svg>
      <span>{label}</span>
    </div>
  )
}
