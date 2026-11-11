import { type ReactNode, useEffect, useId, useRef, useState } from 'react'
import type { InputHTMLAttributes } from 'preact'
import type { StringProps } from './stringProps'

export interface CheckboxProps extends StringProps<Omit<InputHTMLAttributes, 'type' | 'role'>> {
  label?: ReactNode
  labelPosition?: 'left' | 'right'
  /** Visual "mixed" state. Must be set imperatively on the DOM node, since HTML has no `indeterminate` attribute. */
  indeterminate?: boolean
}

export function Checkbox({
  label,
  labelPosition = 'left',
  indeterminate = false,
  className = '',
  disabled,
  checked,
  defaultChecked,
  onChange,
  id,
  ref,
  ...rest
}: CheckboxProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const internalRef = useRef<HTMLInputElement>(null)

  // Keep our own handle on the input (for `indeterminate`) while still forwarding it to the caller's ref, if any.
  function setRefs(node: HTMLInputElement | null) {
    internalRef.current = node
    if (typeof ref === 'function') ref(node)
    else if (ref) ref.current = node
  }

  useEffect(() => {
    if (internalRef.current) {
      internalRef.current.indeterminate = indeterminate
    }
  }, [indeterminate])

  const [uncontrolledChecked, setUncontrolledChecked] = useState(defaultChecked ?? false)
  const isControlled = checked !== undefined
  const isChecked = isControlled ? checked : uncontrolledChecked
  const isFilled = isChecked || indeterminate

  return (
    <label
      htmlFor={inputId}
      className={`inline-flex items-center gap-2 text-on-surface ${disabled ? 'pointer-events-none opacity-[0.38]' : 'cursor-pointer'} ${className}`}
    >
      {label && labelPosition === 'left' && <span className="flex-1">{label}</span>}
      <span
        className={`relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
          isFilled
            ? 'hover:bg-primary/8 active:bg-primary/12'
            : 'hover:bg-on-surface/8 active:bg-on-surface/12'
        }`}
      >
        <input
          ref={setRefs}
          type="checkbox"
          id={inputId}
          checked={checked}
          defaultChecked={checked === undefined ? defaultChecked : undefined}
          disabled={disabled}
          aria-checked={indeterminate ? 'mixed' : undefined}
          onChange={(event) => {
            if (!isControlled) {
              setUncontrolledChecked(event.currentTarget.checked)
            }
            onChange?.(event)
          }}
          className="peer absolute -m-px h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 [clip:rect(0,0,0,0)]"
          {...rest}
        />
        <span
          aria-hidden="true"
          className={`flex h-5 w-5 items-center justify-center rounded-xs border-2 transition-colors 
            peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary ${
              isFilled ? 'border-primary bg-primary' : 'border-outline bg-transparent'
            }`}
        >
          {indeterminate ? (
            <svg viewBox="0 0 18 18" className="h-4 w-4 text-on-primary" fill="none">
              <path d="M4 9h10" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
            </svg>
          ) : isChecked ? (
            <svg viewBox="0 0 18 18" className="h-4 w-4 text-on-primary" fill="none">
              <path
                d="M4 9.5l3 3 7-7"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : null}
        </span>
      </span>
      {label && labelPosition === 'right' && <span className=" flex-1">{label}</span>}
    </label>
  )
}
