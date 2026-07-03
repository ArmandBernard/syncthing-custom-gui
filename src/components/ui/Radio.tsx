import { forwardRef, useId, useState, type InputHTMLAttributes } from 'react'

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
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
      <span
        className={`relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${
          isChecked ? 'hover:bg-primary/8 active:bg-primary/12' : 'hover:bg-on-surface/8 active:bg-on-surface/12'
        }`}
      >
        <input
          ref={ref}
          type="radio"
          id={inputId}
          checked={checked}
          defaultChecked={checked === undefined ? defaultChecked : undefined}
          disabled={disabled}
          onChange={(event) => {
            if (!isControlled) setUncontrolledChecked(event.target.checked)
            onChange?.(event)
          }}
          className="peer absolute -m-px h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 [clip:rect(0,0,0,0)]"
          {...rest}
        />
        <span
          aria-hidden="true"
          className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary ${
            isChecked ? 'border-primary' : 'border-outline'
          }`}
        >
          {isChecked && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
        </span>
      </span>
      {label && <span className="text-sm text-on-surface">{label}</span>}
    </label>
  )
})
