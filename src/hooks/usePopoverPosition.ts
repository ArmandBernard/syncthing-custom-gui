import { useCallback, useLayoutEffect, useState, type RefObject } from 'react'

export interface PopoverOrigin {
  vertical: 'top' | 'bottom'
  horizontal: 'left' | 'right'
}

export interface UsePopoverPositionOptions {
  /** Point on the trigger to anchor from. */
  anchorOrigin?: PopoverOrigin
  /** Point on the popover placed at that anchor point. */
  transformOrigin?: PopoverOrigin
  /** Gap between the trigger and the popover, in px. Default: 4. */
  gap?: number
}

export interface PopoverPosition {
  top: number
  left: number
  /** Width of the trigger element, useful for popups (like Select) that should match it. */
  width: number
}

interface Size {
  width: number
  height: number
}

const CANDIDATE_PLACEMENTS: { anchorOrigin: PopoverOrigin; transformOrigin: PopoverOrigin }[] = [
  {
    anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
    transformOrigin: { vertical: 'top', horizontal: 'left' },
  },
  {
    anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
    transformOrigin: { vertical: 'top', horizontal: 'right' },
  },
  {
    anchorOrigin: { vertical: 'top', horizontal: 'left' },
    transformOrigin: { vertical: 'bottom', horizontal: 'left' },
  },
  {
    anchorOrigin: { vertical: 'top', horizontal: 'right' },
    transformOrigin: { vertical: 'bottom', horizontal: 'right' },
  },
]

function place(
  triggerRect: DOMRect,
  popoverSize: Size,
  anchorOrigin: PopoverOrigin,
  transformOrigin: PopoverOrigin,
  gap: number,
): { top: number; left: number } {
  const anchorX = anchorOrigin.horizontal === 'left' ? triggerRect.left : triggerRect.right
  const anchorY = anchorOrigin.vertical === 'top' ? triggerRect.top : triggerRect.bottom
  const left = transformOrigin.horizontal === 'left' ? anchorX : anchorX - popoverSize.width
  const verticalGap = anchorOrigin.vertical === 'bottom' ? gap : -gap
  const top =
    (transformOrigin.vertical === 'top' ? anchorY : anchorY - popoverSize.height) + verticalGap
  return { top, left }
}

function fitsInViewport(top: number, left: number, size: Size): boolean {
  return (
    top >= 0 &&
    left >= 0 &&
    top + size.height <= window.innerHeight &&
    left + size.width <= window.innerWidth
  )
}

/**
 * Computes a fixed-position placement for a popover anchored to a trigger
 * element, following the same anchorOrigin/transformOrigin model as MUI's
 * Popover: anchorOrigin picks a point on the trigger, transformOrigin picks
 * the point on the popover that gets placed there.
 *
 * When neither is given (the common case), the hook tries all four corner
 * placements (below/above, left/right-aligned) and picks the first that
 * actually fits the viewport — "whatever direction is best suited" — falling
 * back to below-left, clamped on-screen, if none fit perfectly. Passing
 * either origin explicitly opts out of auto-placement entirely; the given
 * (or default-completed) origins are used as-is.
 *
 * Recalculated on open, and on scroll/resize while open.
 */
export function usePopoverPosition(
  triggerRef: RefObject<HTMLElement | null>,
  popoverRef: RefObject<HTMLElement | null>,
  isOpen: boolean,
  options: UsePopoverPositionOptions = {},
): PopoverPosition {
  const { anchorOrigin, transformOrigin, gap = 4 } = options
  const isPinned = anchorOrigin !== undefined || transformOrigin !== undefined
  const [position, setPosition] = useState<PopoverPosition>({ top: 0, left: 0, width: 0 })

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current
    if (!trigger) return
    const triggerRect = trigger.getBoundingClientRect()
    const popoverRect = popoverRef.current?.getBoundingClientRect()
    const popoverSize: Size = { width: popoverRect?.width ?? 0, height: popoverRect?.height ?? 0 }

    let placement: { top: number; left: number }

    if (isPinned) {
      placement = place(
        triggerRect,
        popoverSize,
        anchorOrigin ?? CANDIDATE_PLACEMENTS[0].anchorOrigin,
        transformOrigin ?? CANDIDATE_PLACEMENTS[0].transformOrigin,
        gap,
      )
    } else {
      const fitting = CANDIDATE_PLACEMENTS.map((candidate) => ({
        candidate,
        result: place(
          triggerRect,
          popoverSize,
          candidate.anchorOrigin,
          candidate.transformOrigin,
          gap,
        ),
      })).find(({ result }) => fitsInViewport(result.top, result.left, popoverSize))

      placement =
        fitting?.result ??
        place(
          triggerRect,
          popoverSize,
          CANDIDATE_PLACEMENTS[0].anchorOrigin,
          CANDIDATE_PLACEMENTS[0].transformOrigin,
          gap,
        )
      if (!fitting) {
        // Nothing fit cleanly — clamp on-screen rather than let it overflow.
        placement = {
          top: Math.min(
            Math.max(placement.top, 0),
            Math.max(0, window.innerHeight - popoverSize.height),
          ),
          left: Math.min(
            Math.max(placement.left, 0),
            Math.max(0, window.innerWidth - popoverSize.width),
          ),
        }
      }
    }

    setPosition({ top: placement.top, left: placement.left, width: triggerRect.width })
  }, [triggerRef, popoverRef, isPinned, anchorOrigin, transformOrigin, gap])

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
