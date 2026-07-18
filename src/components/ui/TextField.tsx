import { forwardRef, type ReactNode, useId, useState } from 'react'
import type { InputHTMLAttributes } from 'preact'

export type TextFieldVariant = 'filled' | 'outlined'

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: TextFieldVariant
  label: string
  supportingText?: ReactNode
  error?: boolean
  endAdornment?: ReactNode
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
    endAdornment,
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
        <div
          className={
            'flex items-center justify-between' +
            (variant === 'filled'
              ? ` h-14 px-4 pt-4 rounded-t-xs border-b-2 bg-surface-high text-base text-on-surface outline-none  ${borderColor}`
              : ` h-14 px-4 pt-1 rounded-xs bg-transparent text-base text-on-surface outline-none`)
          }
        >
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
              setUncontrolledValue(event.currentTarget.value)
              onChange?.(event)
            }}
            className="flex-1 disabled:opacity-[0.38] outline-none"
            {...props}
          />
          {endAdornment && <div className="-mr-4">{endAdornment}</div>}
        </div>

        {variant === 'outlined' && (
          // The border lives on this fieldset rather than the input. A <legend> inside a
          // <fieldset> border punches a real gap in the border stroke around itself, which is
          // what actually "notches" the floating label in — no background color to match the
          // field's surroundings, unlike patching a colored box over the border line.
          <fieldset
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 m-0 min-w-0 rounded-xs top-0 border px-3 transition-colors ${borderColor}`}
          >
            <legend
              className="invisible overflow-hidden whitespace-nowrap text-xs leading-none transition-[max-width] duration-150"
              style={{ maxWidth: isFloating ? 1000 : 0 }}
            >
              {/* Padding lives on this inner span, not the legend itself — padding on the
                  legend would keep a residual gap even at max-width: 0. */}
              <span className="px-1">{label}</span>
            </legend>
          </fieldset>
        )}
        <label
          htmlFor={inputId}
          className={
            isFloating
              ? `pointer-events-none absolute origin-left left-4 text-xs leading-none transition-all ${
                  variant === 'outlined' ? 'top-0' : 'top-2'
                } ${labelColor}`
              : `pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base transition-all ${labelColor}`
          }
        >
          {label}
        </label>
      </div>
      {supportingText && (
        <p
          id={supportingId}
          className={`mt-1 px-4 text-xs ${error ? 'text-error' : 'text-on-surface-variant'}`}
        >
          {supportingText}
        </p>
      )}
    </div>
  )
})
