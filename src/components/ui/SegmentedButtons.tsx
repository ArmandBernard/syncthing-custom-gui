import { useId } from 'react'

export interface SegmentedButtonsOption {
  value: string
  label: string
}

export interface SegmentedButtonsProps {
  options: SegmentedButtonsOption[]
  value: string
  onChange: (value: string) => void
  name?: string
  disabled?: boolean
  className?: string
  'aria-label': string
  /**
   * Set when nesting inside a `role="menu"` (e.g. via `Menu.Toggle`). A plain
   * `radiogroup`/`radio` pair isn't a valid descendant of `menu` — even
   * wrapped in `role="group"`, the ARIA required-owned-elements check is
   * recursive, so every leaf still has to resolve to a `menuitem*` role. This
   * swaps the container to `group` and each input's role to `menuitemradio`
   * instead.
   */
  asMenuItems?: boolean
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" aria-hidden="true">
      <path
        d="M5 13l4 4L19 7"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * Material 3 "Segmented buttons" — a connected row of buttons for a single
 * choice. Real native <input type="radio"> per segment (visually hidden,
 * same technique as Radio/Checkbox/Switch), sharing one `name`, so arrow-key
 * cycling between segments is native — no hand-rolled keyboard handling.
 */
export function SegmentedButtons({
  options,
  value,
  onChange,
  name,
  disabled = false,
  className = '',
  'aria-label': ariaLabel,
  asMenuItems = false,
}: SegmentedButtonsProps) {
  const generatedName = useId()
  const groupName = name ?? generatedName

  return (
    <div
      role={asMenuItems ? 'group' : 'radiogroup'}
      aria-label={ariaLabel}
      aria-orientation="horizontal"
      className={`inline-flex ${className}`}
    >
      {options.map((option, index) => {
        const isSelected = value === option.value
        const isFirst = index === 0
        const isLast = index === options.length - 1

        return (
          <label
            key={option.value}
            className={[
              'relative inline-flex h-10 cursor-pointer items-center gap-1.5 border px-4 text-sm font-medium transition-colors',
              isFirst ? 'rounded-l-full' : '-ml-px',
              isLast ? 'rounded-r-full' : '',
              isSelected
                ? 'border-outline bg-secondary-container text-on-secondary-container hover:bg-secondary-container/90 active:bg-secondary-container/80'
                : 'border-outline bg-transparent text-on-surface hover:bg-on-surface/8 active:bg-on-surface/12',
              disabled ? 'pointer-events-none opacity-[0.38]' : '',
            ].join(' ')}
          >
            <input
              type="radio"
              role={asMenuItems ? 'menuitemradio' : undefined}
              aria-checked={asMenuItems ? isSelected : undefined}
              name={groupName}
              value={option.value}
              checked={isSelected}
              disabled={disabled}
              onChange={() => onChange(option.value)}
              className="peer absolute -m-px h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 [clip:rect(0,0,0,0)]"
            />
            <span className="pointer-events-none absolute inset-0 rounded-[inherit] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary" />
            {isSelected && <CheckIcon />}
            {option.label}
          </label>
        )
      })}
    </div>
  )
}
