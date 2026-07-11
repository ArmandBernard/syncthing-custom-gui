import { forwardRef, useId, useState, type InputHTMLAttributes } from 'react'

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'role'> {
  label?: string
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { label, className = '', disabled, checked, defaultChecked, onChange, id, ...rest },
  ref,
) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  const [uncontrolledChecked, setUncontrolledChecked] = useState(defaultChecked ?? false)
  const isControlled = checked !== undefined
  const isChecked = isControlled ? checked : uncontrolledChecked

  return (
    <label
      htmlFor={inputId}
      className={`inline-flex items-center gap-2 ${disabled ? 'pointer-events-none opacity-[0.38]' : 'cursor-pointer'} ${className}`}
    >
      <span className="relative inline-flex h-8 w-[52px] shrink-0 items-center">
        <input
          ref={ref}
          type="checkbox"
          role="switch"
          id={inputId}
          checked={checked}
          defaultChecked={checked === undefined ? defaultChecked : undefined}
          disabled={disabled}
          aria-checked={isChecked}
          onChange={(event) => {
            if (!isControlled) setUncontrolledChecked(event.currentTarget.checked)
            onChange?.(event)
          }}
          className="peer absolute -m-px h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 [clip:rect(0,0,0,0)]"
          {...rest}
        />
        <span
          aria-hidden="true"
          className={`flex h-8 w-[52px] items-center rounded-full border-2 transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary ${
            isChecked ? 'border-primary bg-primary' : 'border-outline bg-surface-high'
          }`}
        >
          <span
            className={`inline-block rounded-full transition-all ${
              isChecked
                ? 'h-6 w-6 translate-x-[22px] bg-on-primary'
                : 'h-4 w-4 translate-x-1 bg-outline'
            }`}
          />
        </span>
      </span>
      {label && <span className="text-sm text-on-surface">{label}</span>}
    </label>
  )
})
