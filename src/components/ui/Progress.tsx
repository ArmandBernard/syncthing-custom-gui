import { forwardRef, type HTMLAttributes } from 'react'

export interface LinearProgressProps extends HTMLAttributes<HTMLDivElement> {
  /** 0-100. Omit for an indeterminate progress bar. */
  value?: number
}

export const LinearProgress = forwardRef<HTMLDivElement, LinearProgressProps>(function LinearProgress(
  { value, className = '', ...props },
  ref,
) {
  const indeterminate = value === undefined

  return (
    <div
      ref={ref}
      role="progressbar"
      aria-valuenow={indeterminate ? undefined : value}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`h-1 w-full overflow-hidden rounded-full bg-secondary-container ${className}`}
      {...props}
    >
      {indeterminate ? (
        <div className="h-full w-1/2 origin-left animate-[linear-progress-indeterminate_1.5s_ease-in-out_infinite] rounded-full bg-primary" />
      ) : (
        <div
          className="h-full rounded-full bg-primary transition-[width]"
          style={{ width: `${value}%` }}
        />
      )}
    </div>
  )
})

export interface CircularProgressProps extends HTMLAttributes<HTMLDivElement> {
  /** 0-100. Omit for an indeterminate progress bar. */
  value?: number
  /** Diameter in pixels. Defaults to 40. */
  size?: number
  /** Stroke width in pixels. Defaults to 4. */
  strokeWidth?: number
}

export const CircularProgress = forwardRef<HTMLDivElement, CircularProgressProps>(function CircularProgress(
  { value, size = 40, strokeWidth = 4, className = '', ...props },
  ref,
) {
  const indeterminate = value === undefined
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const dashoffset = indeterminate ? circumference * 0.75 : circumference * (1 - value / 100)

  return (
    <div
      ref={ref}
      role="progressbar"
      aria-valuenow={indeterminate ? undefined : value}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`inline-block ${className}`}
      {...props}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={indeterminate ? 'animate-[circular-progress-rotate_1.2s_linear_infinite]' : ''}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-secondary-container"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="stroke-primary transition-[stroke-dashoffset]"
        />
      </svg>
    </div>
  )
})
