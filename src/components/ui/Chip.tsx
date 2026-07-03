import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: ReactNode
  children?: ReactNode
  selected?: boolean
  /** When provided, a separate trailing "remove" button is rendered alongside the chip. */
  onRemove?: () => void
}

const OUTLINE_CLASSES: Record<'selected' | 'unselected', string> = {
  unselected: 'border border-outline bg-surface text-on-surface-variant',
  selected: 'border border-transparent bg-secondary-container text-on-secondary-container',
}

const HOVER_CLASSES: Record<'selected' | 'unselected', string> = {
  unselected: 'hover:bg-on-surface/8 active:bg-on-surface/12',
  selected: 'hover:bg-on-secondary-container/8 active:bg-on-secondary-container/12',
}

const FOCUS_CLASSES =
  'transition-colors disabled:pointer-events-none disabled:opacity-[0.38] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" aria-hidden="true">
      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function RemoveIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export const Chip = forwardRef<HTMLButtonElement, ChipProps>(function Chip(
  { label, children, selected = false, onRemove, className = '', type = 'button', disabled, ...props },
  ref,
) {
  const content = label ?? children
  const state = selected ? 'selected' : 'unselected'
  const outlineClasses = OUTLINE_CLASSES[state]
  const hoverClasses = HOVER_CLASSES[state]

  if (!onRemove) {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={`inline-flex h-8 items-center gap-1.5 rounded-sm px-4 text-sm font-medium ${FOCUS_CLASSES} ${outlineClasses} ${hoverClasses} ${className}`}
        {...props}
      >
        {selected && <CheckIcon />}
        {content}
      </button>
    )
  }

  return (
    <div role="group" className={`inline-flex h-8 items-center rounded-sm text-sm font-medium ${outlineClasses} ${className}`}>
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={`inline-flex h-full items-center gap-1.5 rounded-l-sm pl-4 pr-2 ${FOCUS_CLASSES} ${hoverClasses}`}
        {...props}
      >
        {selected && <CheckIcon />}
        {content}
      </button>
      <button
        type="button"
        aria-label={`Remove ${typeof content === 'string' ? content : 'chip'}`}
        onClick={onRemove}
        disabled={disabled}
        className={`inline-flex h-full items-center rounded-r-sm pl-1 pr-3 ${FOCUS_CLASSES} ${hoverClasses}`}
      >
        <RemoveIcon />
      </button>
    </div>
  )
})
