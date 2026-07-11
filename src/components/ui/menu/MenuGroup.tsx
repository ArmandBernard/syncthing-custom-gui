import type { ReactNode } from 'react'

export interface MenuGroupProps {
  children: ReactNode
  disabled?: boolean
  className?: string
  /** Internal: injected by Menu via cloneElement, do not pass directly. */
  _itemRef?: (node: HTMLElement | null) => void
}

/**
 * A single roving-tabindex slot in a `Menu` that wraps a composite widget
 * (e.g. `SegmentedButtons`) instead of a single clickable label. Unlike
 * `MenuItem`, selecting a value inside it does not close the menu — the menu
 * may hold other items above/below that the user likely wants to keep using.
 * Must be a direct child of `Menu`.
 */
export function MenuGroup({ children, className = '', _itemRef }: MenuGroupProps) {
  return (
    <div role="group" ref={_itemRef} className={`px-3 py-2 ${className}`}>
      {children}
    </div>
  )
}
