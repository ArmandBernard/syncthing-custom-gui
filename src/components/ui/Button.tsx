import { forwardRef, type ButtonHTMLAttributes } from 'react'

export type ButtonVariant = 'filled' | 'tonal' | 'outlined' | 'text' | 'elevated'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  filled: 'bg-primary text-on-primary hover:bg-primary/90 active:bg-primary/80',
  tonal:
    'bg-secondary-container text-on-secondary-container hover:bg-secondary-container/90 active:bg-secondary-container/80',
  outlined:
    'bg-transparent text-primary border border-outline hover:bg-primary/8 active:bg-primary/12',
  text: 'bg-transparent text-primary hover:bg-primary/8 active:bg-primary/12',
  elevated: 'bg-surface-low text-primary shadow-sm hover:shadow-md active:shadow-sm',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'filled', className = '', type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-full px-6 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-[0.38] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  )
})
