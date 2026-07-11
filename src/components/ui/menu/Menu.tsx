import {
  Children,
  cloneElement,
  useId,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react'
import type { TargetedKeyboardEvent, TargetedToggleEvent } from 'preact'
import { usePopoverPosition, type PopoverOrigin } from '@hooks/usePopoverPosition.ts'
import { useRovingMenuFocus } from '@hooks/useRovingMenuFocus.ts'
import { MenuItem } from './MenuItem.tsx'
import { MenuGroup } from './MenuGroup.tsx'
import { isMenuItemElement, isMenuGroupElement } from './menuChildGuards.ts'

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
  const triggerRef = useRef<HTMLButtonElement>(null)
  const triggerId = useId()
  const popoverId = useId()
  const popoverRef = useRef<HTMLDivElement>(null)

  const { top, left } = usePopoverPosition(triggerRef, popoverRef, isOpen, {
    anchorOrigin,
    transformOrigin,
  })

  const {
    focusedIndex,
    itemNodesRef,
    enabledIndices,
    focusItemByIndex,
    moveFocus,
    moveFocusToEnd,
    moveFocusByTypeahead,
    resetFocus,
  } = useRovingMenuFocus(children, popoverRef)

  const requestClose = (returnFocus: boolean) => {
    popoverRef.current?.hidePopover()
    setIsOpen(false)
    resetFocus()
    if (returnFocus) triggerRef.current?.focus()
  }

  const openMenu = (initialFocus: 'first' | 'last') => {
    setIsOpen(true)
    popoverRef.current?.showPopover()
    const indices = enabledIndices()
    if (indices.length === 0) return
    const targetIndex = initialFocus === 'first' ? indices[0] : indices[indices.length - 1]
    focusItemByIndex(targetIndex)
  }

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
      resetFocus()
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
        className="min-w-28 rounded-xs bg-surface py-2 shadow-lg"
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
          if (isMenuGroupElement(child)) {
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
Menu.Toggle = MenuGroup
