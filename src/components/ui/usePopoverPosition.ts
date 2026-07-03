import { useCallback, useLayoutEffect, useState, type RefObject } from 'react'

export interface PopoverPosition {
  top: number
  left: number
  /** Width of the trigger element, useful for popups (like Select) that should match it. */
  width: number
}

/**
 * Computes a fixed-position placement anchored just below a trigger element,
 * recalculated while the popover is open (on open, scroll, and resize).
 * Plain getBoundingClientRect-based positioning rather than CSS anchor
 * positioning, for broader browser support.
 */
export function usePopoverPosition(triggerRef: RefObject<HTMLElement | null>, isOpen: boolean): PopoverPosition {
  const [position, setPosition] = useState<PopoverPosition>({ top: 0, left: 0, width: 0 })

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current
    if (!trigger) return
    const rect = trigger.getBoundingClientRect()
    const left = Math.min(rect.left, Math.max(0, window.innerWidth - rect.width - 8))
    setPosition({ top: rect.bottom + 4, left, width: rect.width })
  }, [triggerRef])

  useLayoutEffect(() => {
    if (!isOpen) return
    updatePosition()
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [isOpen, updatePosition])

  return position
}
