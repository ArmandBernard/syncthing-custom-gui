import {
  Children,
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
  useId,
} from 'react'
import type {
  ButtonHTMLAttributes,
  TargetedKeyboardEvent,
  TargetedToggleEvent,
} from 'preact'
import { usePopoverPosition, type PopoverOrigin } from './usePopoverPosition'

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

function isMenuItemElement(node: ReactNode): node is ReactElement<MenuItemProps> {
  return isValidElement(node) && (node as ReactElement).type === MenuItem
}

export interface MenuToggleProps {
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
export function MenuToggle({ children, className = '', _itemRef }: MenuToggleProps) {
  return (
    <div role="group" ref={_itemRef} className={`px-3 py-2 ${className}`}>
      {children}
    </div>
  )
}

function isMenuToggleElement(node: ReactNode): node is ReactElement<MenuToggleProps> {
  return isValidElement(node) && (node as ReactElement).type === MenuToggle
}

export interface MenuProps {
  /**
   * Point on the trigger to anchor the popup from. If the caller knows where
   * the trigger sits on screen (e.g. pinned to a corner), setting this
   * (together with `transformOrigin`) picks a placement outright instead of
   * relying on `usePopoverPosition`'s runtime auto-fit.
   */
  anchorOrigin?: PopoverOrigin
  /** Point on the popup placed at `anchorOrigin`. See `anchorOrigin`. */
  transformOrigin?: PopoverOrigin
  /** `Menu.Item`/`Menu.Toggle` elements only. */
  children: ReactNode
  /** The Button to render **/
  button: ReactElement<HTMLButtonElement>
}

/**
 * An action-list menu opened from a trigger button (the WAI-ARIA "Menu
 * Button" pattern), e.g. a "..." overflow menu. Not to be confused with
 * "Select", a form dropdown built separately.
 */
export function Menu({ anchorOrigin, transformOrigin, children, button }: MenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const triggerId = useId()
  const popoverId = useId()
  const popoverRef = useRef<HTMLDivElement>(null)
  const itemNodesRef = useRef<Map<number, HTMLElement>>(new Map())
  const typeaheadRef = useRef<{ text: string; timeout: ReturnType<typeof setTimeout> | null }>({
    text: '',
    timeout: null,
  })

  const { top, left } = usePopoverPosition(triggerRef, popoverRef, isOpen, {
    anchorOrigin,
    transformOrigin,
  })

  const items = Children.toArray(children).reduce<
    { index: number; disabled: boolean; label: string }[]
  >((acc, child, index) => {
    if (isMenuItemElement(child)) {
      acc.push({
        index,
        disabled: !!child.props.disabled,
        label: typeof child.props.children === 'string' ? child.props.children : '',
      })
    } else if (isMenuToggleElement(child)) {
      // No text label to typeahead-match against — that's fine, typeahead
      // simply never lands on this item, which is the expected behavior.
      acc.push({ index, disabled: !!child.props.disabled, label: '' })
    }
    return acc
  }, [])

  const enabledIndices = useCallback(() => {
    return items.filter((item) => !item.disabled).map((item) => item.index)
  }, [items])

  // Preact's onFocus is a plain, non-bubbling native `focus` listener, unlike
  // React's document-level `focusin`-backed simulated bubbling. A Menu.Toggle
  // delegates focus to a nested radio input rather than its own wrapper div,
  // so an onFocus prop on that div would never fire. Track focus with a real
  // `focusin` listener instead, which bubbles regardless — this also keeps
  // focusedIndex in sync when the user mouse-clicks a segment directly.
  useEffect(() => {
    const container = popoverRef.current
    if (!container) return

    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement
      for (const [index, node] of itemNodesRef.current) {
        if (node === target || node.contains(target)) {
          setFocusedIndex(index)
          return
        }
      }
    }

    container.addEventListener('focusin', handleFocusIn)
    return () => container.removeEventListener('focusin', handleFocusIn)
  }, [])

  const focusItemByIndex = useCallback((index: number) => {
    const node = itemNodesRef.current.get(index)
    if (!node) return
    if (node instanceof HTMLButtonElement) {
      node.focus()
      return
    }
    // Composite item (Menu.Toggle): delegate focus to its checked radio (or
    // the first one), rather than the non-focusable wrapper div.
    const radios = node.querySelectorAll<HTMLInputElement>('input[type="radio"]')
    const checked = Array.from(radios).find((radio) => radio.checked) ?? radios[0]
    checked?.focus()
  }, [])

  const requestClose = useCallback((returnFocus: boolean) => {
    popoverRef.current?.hidePopover()
    setIsOpen(false)
    setFocusedIndex(-1)
    if (returnFocus) triggerRef.current?.focus()
  }, [])

  const openMenu = useCallback(
    (initialFocus: 'first' | 'last') => {
      setIsOpen(true)
      popoverRef.current?.showPopover()
      const indices = enabledIndices()
      if (indices.length === 0) return
      const targetIndex = initialFocus === 'first' ? indices[0] : indices[indices.length - 1]
      focusItemByIndex(targetIndex)
    },
    [enabledIndices, focusItemByIndex],
  )

  const moveFocus = useCallback(
    (direction: 1 | -1) => {
      const indices = enabledIndices()
      if (indices.length === 0) return
      const currentPos = indices.indexOf(focusedIndex)
      const nextPos =
        currentPos === -1
          ? direction === 1
            ? 0
            : indices.length - 1
          : (currentPos + direction + indices.length) % indices.length
      focusItemByIndex(indices[nextPos])
    },
    [enabledIndices, focusedIndex, focusItemByIndex],
  )

  const moveFocusToEnd = useCallback(
    (end: 'first' | 'last') => {
      const indices = enabledIndices()
      if (indices.length === 0) return
      focusItemByIndex(end === 'first' ? indices[0] : indices[indices.length - 1])
    },
    [enabledIndices, focusItemByIndex],
  )

  const moveFocusByTypeahead = useCallback(
    (char: string) => {
      const state = typeaheadRef.current
      if (state.timeout) clearTimeout(state.timeout)
      state.text += char.toLowerCase()
      state.timeout = setTimeout(() => {
        state.text = ''
      }, 500)

      const indices = enabledIndices()
      if (indices.length === 0) return
      const currentPos = indices.indexOf(focusedIndex)
      // Start searching just after the current item so repeated presses of
      // the same letter cycle through matches.
      for (let offset = 1; offset <= indices.length; offset++) {
        const candidateIndex = indices[(currentPos + offset) % indices.length]
        const item = items.find((it) => it.index === candidateIndex)
        if (item && item.label.toLowerCase().startsWith(state.text)) {
          focusItemByIndex(candidateIndex)
          return
        }
      }
    },
    [enabledIndices, focusedIndex, focusItemByIndex, items],
  )

  const handleTriggerKeyDown = (event: TargetedKeyboardEvent<HTMLButtonElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        openMenu('first')
        break
      case 'ArrowUp':
        event.preventDefault()
        openMenu('last')
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        openMenu('first')
        break
      default:
        break
    }
  }

  const handleTriggerClick = () => {
    if (isOpen) {
      requestClose(false)
    } else {
      openMenu('first')
    }
  }

  const handleMenuKeyDown = (event: TargetedKeyboardEvent<HTMLDivElement>) => {
    // Once focus has been delegated into a Menu.Toggle's composite widget
    // (e.g. a radiogroup, or a group of menuitemradio inputs), step aside for
    // Left/Right/Space and let the native control handle its own horizontal
    // keyboard behavior (cycling between segments, Space to select). Up/Down
    // still move between menu items — without this, a native radio group
    // swallows all four arrow keys for segment-switching, leaving no way to
    // reach the rest of the menu.
    const target = event.target as HTMLElement
    const isInsideComposite = target.closest('[role="radiogroup"], [role="group"]') !== null
    const isCompositeOwnKey = ['ArrowLeft', 'ArrowRight', ' '].includes(event.key)
    if (isInsideComposite && isCompositeOwnKey) {
      return
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        moveFocus(1)
        break
      case 'ArrowUp':
        event.preventDefault()
        moveFocus(-1)
        break
      case 'Home':
        event.preventDefault()
        moveFocusToEnd('first')
        break
      case 'End':
        event.preventDefault()
        moveFocusToEnd('last')
        break
      case 'Escape':
        event.preventDefault()
        requestClose(true)
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        itemNodesRef.current.get(focusedIndex)?.click()
        break
      case 'Tab':
        // Don't fight the browser's own focus movement, just close.
        requestClose(false)
        break
      default:
        if (event.key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey) {
          moveFocusByTypeahead(event.key)
        }
        break
    }
  }

  const handleToggle = (event: TargetedToggleEvent<HTMLDivElement>) => {
    // Keep React state in sync when the browser closes/opens the popover
    // for us (native click-outside / Escape light-dismiss).
    if (event.newState === 'closed' && isOpen) {
      setIsOpen(false)
      setFocusedIndex(-1)
    } else if (event.newState === 'open' && !isOpen) {
      setIsOpen(true)
    }
  }

  return (
    <>
      {cloneElement(button, {
        id: triggerId,
        ref: triggerRef,
        'aria-haspopup': 'menu',
        'aria-expanded': isOpen,
        'aria-controls': popoverId,
        onClick: handleTriggerClick,
        onKeyDown: handleTriggerKeyDown,
      })}
      <div
        ref={popoverRef}
        id={popoverId}
        popover="auto"
        role="menu"
        aria-labelledby={triggerId}
        onToggle={handleToggle}
        onKeyDown={handleMenuKeyDown}
        style={{ position: 'fixed', top, left, margin: 0 }}
        className="min-w-[112px] rounded-xs bg-surface py-2 shadow-lg"
      >
        {Children.map(children, (child, index) => {
          if (isMenuItemElement(child)) {
            return cloneElement(child, {
              _focused: focusedIndex === index,
              _itemRef: (node: HTMLElement | null) => {
                if (node) itemNodesRef.current.set(index, node)
                else itemNodesRef.current.delete(index)
              },
              onSelect: () => {
                child.props.onSelect()
                requestClose(true)
              },
            })
          }
          if (isMenuToggleElement(child)) {
            return cloneElement(child, {
              _itemRef: (node: HTMLElement | null) => {
                if (node) itemNodesRef.current.set(index, node)
                else itemNodesRef.current.delete(index)
              },
            })
          }
          return child
        })}
      </div>
    </>
  )
}

Menu.Item = MenuItem
Menu.Toggle = MenuToggle
