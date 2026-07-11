import type { ReactNode } from 'react'
import type { ButtonHTMLAttributes } from 'preact'

export interface MenuItemProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onSelect'> {
  onSelect: () => void
  disabled?: boolean
  children: ReactNode
  /** Internal: injected by Menu via cloneElement, do not pass directly. */
  _focused?: boolean
  /** Internal: injected by Menu via cloneElement, do not pass directly. */
  _itemRef?: (node: HTMLElement | null) => void
}

/** A single action in a `Menu`. Must be a direct child of `Menu`. */
export function MenuItem({
  onSelect,
  disabled = false,
  children,
  className = '',
  _focused = false,
  _itemRef,
  ...props
}: MenuItemProps) {
  return (
    <button
      ref={_itemRef}
      type="button"
      role="menuitem"
      tabIndex={_focused ? 0 : -1}
      aria-disabled={disabled}
      onClick={disabled ? undefined : onSelect}
      className={`flex h-12 w-full items-center px-3 text-left text-sm text-on-surface hover:bg-on-surface/8 active:bg-on-surface/12 focus-visible:bg-on-surface/12 focus:outline-none aria-disabled:pointer-events-none aria-disabled:opacity-[0.38] ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
