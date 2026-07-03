import { forwardRef, useId, useState, type InputHTMLAttributes } from 'react'

export type TextFieldVariant = 'filled' | 'outlined'

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: TextFieldVariant
  label: string
  supportingText?: string
  error?: boolean
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  {
    variant = 'outlined',
    label,
    supportingText,
    error = false,
    className = '',
    id,
    onFocus,
    onBlur,
    onChange,
    defaultValue,
    value,
    ...props
  },
  ref,
) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const supportingId = `${inputId}-supporting`
  const [isFocused, setIsFocused] = useState(false)
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? '')
  const currentValue = value !== undefined ? value : uncontrolledValue
  const hasValue = currentValue !== '' && currentValue != null
  const isFloating = isFocused || hasValue

  const borderColor = error ? 'border-error' : isFocused ? 'border-primary' : 'border-outline'
  const labelColor = error ? 'text-error' : isFocused ? 'text-primary' : 'text-on-surface-variant'

  return (
    <div className={className}>
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          value={value}
          defaultValue={value === undefined ? defaultValue : undefined}
          aria-invalid={error || undefined}
          aria-describedby={supportingText ? supportingId : undefined}
          onFocus={(event) => {
            setIsFocused(true)
            onFocus?.(event)
          }}
          onBlur={(event) => {
            setIsFocused(false)
            onBlur?.(event)
          }}
          onChange={(event) => {
            setUncontrolledValue(event.target.value)
            onChange?.(event)
          }}
          className={
            variant === 'filled'
              ? `peer h-14 w-full rounded-t-xs border-b-2 bg-surface-container-highest px-4 pt-5 pb-2 text-base text-on-surface outline-none disabled:opacity-[0.38] ${borderColor}`
              : `peer h-14 w-full rounded-xs border bg-transparent px-4 text-base text-on-surface outline-none disabled:opacity-[0.38] ${borderColor}`
          }
          {...props}
        />
        <label
          htmlFor={inputId}
          className={
            isFloating
              ? `pointer-events-none absolute left-4 top-2 origin-left text-xs transition-all ${
                  variant === 'outlined' ? '-top-2 left-3 bg-surface px-1' : ''
                } ${labelColor}`
              : `pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base transition-all ${labelColor}`
          }
        >
          {label}
        </label>
      </div>
      {supportingText && (
        <p id={supportingId} className={`mt-1 px-4 text-xs ${error ? 'text-error' : 'text-on-surface-variant'}`}>
          {supportingText}
        </p>
      )}
    </div>
  )
})
