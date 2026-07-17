import type { PropsWithChildren } from 'react'
import { useTabsContext } from './useTabsContext'

export interface TabPanelProps extends PropsWithChildren {
  /** Must match the `value` of the `Tab` that controls this panel. */
  value: string
  className?: string
}

/**
 * The content pane for a `Tab`. Only renders `children` while selected, so
 * inactive panels don't do offscreen work; `hidden` keeps it out of the
 * accessibility tree and tab order regardless.
 */
export function TabPanel({ value, children, className = '' }: TabPanelProps) {
  const { idBase, selectedValue } = useTabsContext()
  const isSelected = selectedValue === value

  return (
    <div
      role="tabpanel"
      id={`${idBase}-panel-${value}`}
      aria-labelledby={`${idBase}-tab-${value}`}
      hidden={!isSelected}
      tabIndex={0}
      className={className}
    >
      {isSelected && children}
    </div>
  )
}
