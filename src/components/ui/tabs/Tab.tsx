import { forwardRef, type ReactNode } from 'react'
import type { ButtonHTMLAttributes, TargetedKeyboardEvent } from 'preact'
import { useTabsContext } from './useTabsContext'

export interface TabProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value' | 'id'> {
  /** Identifies this tab and the `TabPanel` it controls — must match a `TabPanel`'s `value`. */
  value: string
  label: ReactNode
  icon?: ReactNode
}

/**
 * A single Material 3 tab. Selection state and ids come from the nearest
 * `Tabs` context, so mounting this outside a `Tabs` throws.
 *
 * Arrow/Home/End keys move focus and selection between sibling `[role="tab"]`
 * elements in the same tablist (WAI-ARIA tabs pattern, automatic activation),
 * found via `closest`/`querySelectorAll` rather than tracked in context —
 * this keeps `Tabs` from having to know its children's shape.
 */
export const Tab = forwardRef<HTMLButtonElement, TabProps>(function Tab(
  { value, label, icon, className = '', disabled, onClick, onKeyDown, ...props },
  ref,
) {
  const { idBase, selectedValue, onSelect } = useTabsContext()
  const isSelected = selectedValue === value
  const tabId = `${idBase}-tab-${value}`
  const panelId = `${idBase}-panel-${value}`

  function handleKeyDown(event: TargetedKeyboardEvent<HTMLButtonElement>) {
    onKeyDown?.(event)
    if (event.defaultPrevented) return

    const tablist = event.currentTarget.closest('[role="tablist"]')
    if (!tablist) return
    const tabs = Array.from(
      tablist.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])'),
    )
    const currentIndex = tabs.indexOf(event.currentTarget)
    if (currentIndex === -1) return

    let nextIndex: number
    switch (event.key) {
      case 'ArrowRight':
        nextIndex = (currentIndex + 1) % tabs.length
        break
      case 'ArrowLeft':
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length
        break
      case 'Home':
        nextIndex = 0
        break
      case 'End':
        nextIndex = tabs.length - 1
        break
      default:
        return
    }

    event.preventDefault()
    tabs[nextIndex].focus()
    tabs[nextIndex].click()
  }

  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      id={tabId}
      aria-selected={isSelected}
      aria-controls={panelId}
      tabIndex={isSelected ? 0 : -1}
      disabled={disabled}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) onSelect(value)
      }}
      onKeyDown={handleKeyDown}
      className={`relative inline-flex h-12 shrink-0 cursor-pointer items-center justify-center gap-2 px-4
      text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2
      focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-[0.38]
      ${isSelected ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}
      ${className}`}
      {...props}
    >
      {icon}
      {label}
      <span
        aria-hidden="true"
        className={`absolute inset-x-0 bottom-0 h-[3px] rounded-t-xs bg-primary transition-transform
        ${isSelected ? 'scale-x-100' : 'scale-x-0'}`}
      />
    </button>
  )
})
