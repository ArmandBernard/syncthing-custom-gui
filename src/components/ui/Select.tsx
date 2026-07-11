import { useCallback, useEffect, useId, useRef, useState } from 'react'
import type { TargetedKeyboardEvent, TargetedToggleEvent } from 'preact'
import { usePopoverPosition } from '@hooks/usePopoverPosition.ts'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps {
  /** Label rendered above/over the field, like TextField's floating label. */
  label: string
  options: SelectOption[]
  value: string | null
  onChange: (value: string) => void
  supportingText?: string
  error?: boolean
  disabled?: boolean
  id?: string
}

/**
 * A Material 3-style form control for choosing one value from a list,
 * styled like `TextField` but opening a popup listbox instead of accepting
 * typed text. Implements the WAI-ARIA "Select-Only Combobox" pattern: the
 * combobox host is a `<button>` (not an `<input>`) since free text entry
 * isn't supported. Not to be confused with `Menu`, a separate action-list
 * dropdown component.
 */
export function Select({
  label,
  options,
  value,
  onChange,
  supportingText,
  error = false,
  disabled = false,
  id,
}: SelectProps) {
  const generatedId = useId()
  const baseId = id ?? generatedId
  const triggerId = `${baseId}-trigger`
  const labelId = `${baseId}-label`
  const listboxId = `${baseId}-listbox`
  const supportingId = `${baseId}-supporting`
  const getOptionId = (index: number) => `${baseId}-option-${index}`

  const [isOpen, setIsOpen] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)

  const triggerRef = useRef<HTMLButtonElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const optionRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const pendingFocusIndexRef = useRef<number | null>(null)
  const typeaheadRef = useRef<{ text: string; timeout: ReturnType<typeof setTimeout> | null }>({
    text: '',
    timeout: null,
  })

  const { top, left, width } = usePopoverPosition(triggerRef, popoverRef, isOpen)

  const selectedIndex = options.findIndex((option) => option.value === value)
  const selectedOption = selectedIndex !== -1 ? options[selectedIndex] : null

  const enabledIndices = useCallback(
    () => options.map((_, index) => index).filter((index) => !options[index].disabled),
    [options],
  )

  const closePopover = useCallback(() => {
    popoverRef.current?.hidePopover()
  }, [])

  const requestClose = useCallback(
    (returnFocus: boolean) => {
      closePopover()
      setIsOpen(false)
      if (returnFocus) triggerRef.current?.focus()
    },
    [closePopover],
  )

  const focusOptionAt = useCallback((index: number) => {
    setHighlightedIndex(index)
    optionRefs.current.get(index)?.focus()
  }, [])

  const openListbox = useCallback(() => {
    const indices = enabledIndices()
    if (indices.length === 0) return
    const targetIndex = selectedIndex !== -1 ? selectedIndex : indices[0]
    pendingFocusIndexRef.current = targetIndex
    setHighlightedIndex(targetIndex)
    setIsOpen(true)
    popoverRef.current?.showPopover()
  }, [enabledIndices, selectedIndex])

  // Once the popover is actually open (and options are rendered), move real
  // DOM focus onto the pending option.
  useEffect(() => {
    if (!isOpen || pendingFocusIndexRef.current === null) return
    const index = pendingFocusIndexRef.current
    pendingFocusIndexRef.current = null
    optionRefs.current.get(index)?.focus()
  }, [isOpen])

  const moveFocus = useCallback(
    (direction: 1 | -1) => {
      const indices = enabledIndices()
      if (indices.length === 0) return
      const currentPos = indices.indexOf(highlightedIndex)
      const nextPos =
        currentPos === -1
          ? direction === 1
            ? 0
            : indices.length - 1
          : (currentPos + direction + indices.length) % indices.length
      focusOptionAt(indices[nextPos])
    },
    [enabledIndices, highlightedIndex, focusOptionAt],
  )

  const moveFocusToEnd = useCallback(
    (end: 'first' | 'last') => {
      const indices = enabledIndices()
      if (indices.length === 0) return
      focusOptionAt(end === 'first' ? indices[0] : indices[indices.length - 1])
    },
    [enabledIndices, focusOptionAt],
  )

  const moveFocusByTypeahead = useCallback(
    (char: string) => {
      const state = typeaheadRef.current
      if (state.timeout) clearTimeout(state.timeout)
      state.text += char.toLowerCase()
      state.timeout = setTimeout(() => {
        state.text = ''
      }, 500)

      const indices = enabledIndices()
      if (indices.length === 0) return
      const currentPos = indices.indexOf(highlightedIndex)
      // Search starting just after the current option so repeated presses of
      // the same letter cycle through matches.
      for (let offset = 1; offset <= indices.length; offset++) {
        const candidateIndex = indices[(currentPos + offset) % indices.length]
        const option = options[candidateIndex]
        if (option && option.label.toLowerCase().startsWith(state.text)) {
          focusOptionAt(candidateIndex)
          return
        }
      }
    },
    [enabledIndices, highlightedIndex, options, focusOptionAt],
  )

  const selectOption = useCallback(
    (index: number) => {
      const option = options[index]
      if (!option || option.disabled) return
      onChange(option.value)
      requestClose(true)
    },
    [options, onChange, requestClose],
  )

  const handleTriggerKeyDown = (event: TargetedKeyboardEvent<HTMLButtonElement>) => {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp':
      case 'Enter':
      case ' ':
        event.preventDefault()
        if (!isOpen) openListbox()
        break
      default:
        break
    }
  }

  const handleTriggerClick = () => {
    if (isOpen) requestClose(false)
    else openListbox()
  }

  const handleListboxKeyDown = (event: TargetedKeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        moveFocus(1)
        break
      case 'ArrowUp':
        event.preventDefault()
        moveFocus(-1)
        break
      case 'Home':
        event.preventDefault()
        moveFocusToEnd('first')
        break
      case 'End':
        event.preventDefault()
        moveFocusToEnd('last')
        break
      case 'Escape':
        event.preventDefault()
        requestClose(true)
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        selectOption(highlightedIndex)
        break
      case 'Tab':
        // Tabbing away from the listbox should close it without fighting
        // the browser's own focus movement.
        requestClose(false)
        break
      default:
        if (event.key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey) {
          moveFocusByTypeahead(event.key)
        }
        break
    }
  }

  const handleToggle = (event: TargetedToggleEvent<HTMLDivElement>) => {
    // Keep React state in sync when the browser closes the popover for us
    // (native click-outside / Escape light-dismiss).
    if (event.newState === 'closed' && isOpen) {
      setIsOpen(false)
    } else if (event.newState === 'open' && !isOpen) {
      setIsOpen(true)
    }
  }

  const focusOrOpen = isFocused || isOpen
  const hasValue = selectedOption !== null
  const isFloating = focusOrOpen || hasValue

  const borderColor = error ? 'border-error' : focusOrOpen ? 'border-primary' : 'border-outline'
  const labelColor = error ? 'text-error' : focusOrOpen ? 'text-primary' : 'text-on-surface-variant'

  return (
    <div>
      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          id={triggerId}
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-labelledby={`${labelId} ${triggerId}`}
          aria-invalid={error || undefined}
          aria-describedby={supportingText ? supportingId : undefined}
          disabled={disabled}
          onClick={handleTriggerClick}
          onKeyDown={handleTriggerKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`flex h-14 w-full items-center justify-between gap-2 rounded-xs border bg-transparent px-4 text-left text-base text-on-surface outline-none disabled:pointer-events-none disabled:opacity-[0.38] ${borderColor}`}
        >
          <span className="truncate">{selectedOption?.label ?? ' '}</span>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className={`h-5 w-5 shrink-0 text-on-surface-variant transition-transform ${isOpen ? 'rotate-180' : ''}`}
          >
            <path fill="currentColor" d="M7 10l5 5 5-5z" />
          </svg>
        </button>
        <label
          id={labelId}
          htmlFor={triggerId}
          className={
            isFloating
              ? `pointer-events-none absolute -top-2 left-3 origin-left bg-surface px-1 text-xs transition-all ${labelColor}`
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
      <div
        ref={popoverRef}
        popover="auto"
        role="listbox"
        id={listboxId}
        aria-labelledby={labelId}
        onToggle={handleToggle}
        onKeyDown={handleListboxKeyDown}
        style={{ position: 'fixed', top, left, margin: 0, minWidth: width }}
        className="rounded-xs bg-surface py-2 shadow-lg"
      >
        {options.map((option, index) => {
          const isSelected = index === selectedIndex
          const isHighlighted = index === highlightedIndex
          return (
            <div
              key={option.value}
              ref={(node) => {
                if (node) optionRefs.current.set(index, node)
                else optionRefs.current.delete(index)
              }}
              id={getOptionId(index)}
              role="option"
              aria-selected={isSelected}
              aria-disabled={option.disabled || undefined}
              tabIndex={isHighlighted ? 0 : -1}
              onClick={() => selectOption(index)}
              className={`flex h-12 w-full cursor-default items-center px-3 text-sm outline-none hover:bg-on-surface/8 active:bg-on-surface/12 focus-visible:bg-on-surface/12 ${
                option.disabled
                  ? 'pointer-events-none opacity-[0.38] text-on-surface'
                  : 'text-on-surface'
              } ${isSelected ? 'bg-secondary-container text-on-secondary-container' : ''}`}
            >
              {option.label}
            </div>
          )
        })}
      </div>
    </div>
  )
}
