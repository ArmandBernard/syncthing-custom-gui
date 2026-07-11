import { forwardRef, type Ref } from 'react'
import type { ButtonHTMLAttributes, HTMLAttributes } from 'preact'

export type CardVariant = 'elevated' | 'filled' | 'outlined'

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onClick'> {
  variant?: CardVariant
  /** When provided, the card renders as an accessible, clickable <button> instead of a <div>. */
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>['onClick']
  disabled?: boolean
}

const VARIANT_CLASSES: Record<CardVariant, string> = {
  elevated: 'bg-surface shadow-sm',
  filled: 'bg-surface-high',
  outlined: 'bg-surface border border-outline-variant',
}

export const Card = forwardRef<HTMLDivElement | HTMLButtonElement, CardProps>(function Card(
  { variant = 'elevated', className = '', onClick, disabled, ...props },
  ref,
) {
  const base = `rounded-md p-4 text-on-surface transition-[box-shadow,filter] ${VARIANT_CLASSES[variant]} ${className}`

  if (onClick) {
    return (
      <button
        ref={ref as Ref<HTMLButtonElement>}
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`w-full text-left hover:shadow-md hover:brightness-95 active:brightness-90 disabled:pointer-events-none disabled:opacity-[0.38] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${base}`}
        {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
      />
    )
  }

  return <div ref={ref as Ref<HTMLDivElement>} className={base} {...props} />
})
