import type { PropsWithChildren } from 'preact/compat'

export interface TabsProps extends PropsWithChildren {
  'aria-label'?: string
  'aria-labelledby'?: string
  className?: string
}

/**
 * Wrap this component around your `Tab`s
 */
export function Tabs({
  children,
  className = '',
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}: TabsProps) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      className={`flex border-b border-outline-variant ${className}`}
    >
      {children}
    </div>
  )
}
