import { type PropsWithChildren } from 'react'

export interface TabsProps extends PropsWithChildren {
  /** Currently selected tab's `value`. */
  value: string
  onChange: (value: string) => void
  'aria-label'?: string
  'aria-labelledby'?: string
  className?: string
}

/**
 * Material 3 tabs container (`role="tablist"`). Wraps `Tab` children in a
 * context that links each `Tab` to its `TabPanel` via matching `value`s,
 * generating the `aria-controls`/`id`/`aria-labelledby` triples itself so
 * callers never have to invent ids.
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
