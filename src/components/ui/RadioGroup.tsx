import { useId } from 'react'
import { Radio } from './Radio'

export interface RadioGroupOption {
  value: string
  label: string
  disabled?: boolean
}

export interface RadioGroupProps {
  options: RadioGroupOption[]
  value?: string
  onChange?: (value: string) => void
  name?: string
  disabled?: boolean
  className?: string
  'aria-label'?: string
  'aria-labelledby'?: string
}

// This accepts `options` + `value`/`onChange` rather than raw `<Radio>` children: it guarantees
// every Radio in the group shares one `name` (native same-name radios already get arrow-key
// navigation for free from the browser) and keeps the role="radiogroup" wiring in one place.
export function RadioGroup({
  options,
  value,
  onChange,
  name,
  disabled = false,
  className = '',
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}: RadioGroupProps) {
  const generatedName = useId()
  const groupName = name ?? generatedName

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      className={`flex flex-col gap-2 ${className}`}
    >
      {options.map((option) => (
        <Radio
          key={option.value}
          name={groupName}
          value={option.value}
          label={option.label}
          checked={value === option.value}
          disabled={disabled || option.disabled}
          onChange={() => onChange?.(option.value)}
        />
      ))}
    </div>
  )
}
