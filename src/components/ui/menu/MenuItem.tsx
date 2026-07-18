import type { ReactNode } from 'react'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'preact'

export interface MenuItemProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement> & AnchorHTMLAttributes<HTMLAnchorElement>,
  'onSelect'
> {
  onClick?: () => void
  /** Renders the item as a link instead of a button, so the destination shows on hover/status bar. */
  href?: string
  disabled?: boolean
  children: ReactNode
  /** Internal: injected by Menu via cloneElement, do not pass directly. */
  _focused?: boolean
  /** Internal: injected by Menu via cloneElement, do not pass directly. */
  _itemRef?: (node: HTMLElement | null) => void
}

const ITEM_CLASS_NAME =
  'flex h-12 w-full items-center px-3 text-left text-sm text-on-surface hover:bg-on-surface/8 active:bg-on-surface/12 ' +
  'focus-visible:bg-on-surface/12 focus:outline-none aria-disabled:pointer-events-none aria-disabled:opacity-[0.38] ' +
  'cursor-pointer aria-disabled:cursor-default'

/** A single action in a `Menu`. Must be a direct child of `Menu`. */
export function MenuItem({
  onClick,
  href,
  disabled = false,
  children,
  className = '',
  _focused = false,
  _itemRef,
  ...props
}: MenuItemProps) {
  if (href) {
    return (
      <a
        ref={_itemRef}
        href={href}
        role="menuitem"
        tabIndex={_focused ? 0 : -1}
        aria-disabled={disabled}
        onClick={disabled ? undefined : onClick}
        className={`${ITEM_CLASS_NAME} ${className}`}
        {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </a>
    )
  }

  return (
    <button
      ref={_itemRef}
      type="button"
      role="menuitem"
      tabIndex={_focused ? 0 : -1}
      aria-disabled={disabled}
      onClick={disabled ? undefined : onClick}
      className={`${ITEM_CLASS_NAME} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
