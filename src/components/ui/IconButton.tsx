import { forwardRef, type ButtonHTMLAttributes } from 'react'

export type IconButtonVariant = 'standard' | 'filled' | 'tonal' | 'outlined'

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> {
  variant?: IconButtonVariant
  /** Icon buttons carry no visible label, so an accessible name is required. */
  'aria-label': string
}

const VARIANT_CLASSES: Record<IconButtonVariant, string> = {
  standard: 'bg-transparent text-on-surface-variant hover:bg-on-surface-variant/8 active:bg-on-surface-variant/12',
  filled: 'bg-primary text-on-primary hover:bg-primary/90 active:bg-primary/80',
  tonal:
    'bg-secondary-container text-on-secondary-container hover:bg-secondary-container/90 active:bg-secondary-container/80',
  outlined:
    'bg-transparent text-on-surface-variant border border-outline-variant hover:bg-on-surface-variant/8 active:bg-on-surface-variant/12',
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { variant = 'standard', className = '', type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors disabled:pointer-events-none disabled:opacity-[0.38] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  )
})
