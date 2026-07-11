import {
  Children,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react'
import { isMenuItemElement, isMenuToggleElement } from '../components/ui/menu/menuChildGuards.ts'

interface MenuFocusItem {
  index: number
  disabled: boolean
  label: string
}

/**
 * Roving-tabindex focus engine for `Menu`: derives the focusable item list
 * from `children`, tracks which one currently "has" focus, and moves focus
 * between them (arrow keys, Home/End, typeahead).
 *
 * Tracking is done via a real `focusin` listener on `containerRef` rather
 * than an `onFocus` prop on each item, because Preact's `onFocus` is a plain
 * non-bubbling native `focus` listener (unlike React's document-level
 * `focusin`-backed simulated bubbling). `Menu.Toggle` delegates focus to a
 * nested radio input rather than its own wrapper div, so an `onFocus` prop
 * on that div would never fire — a real `focusin` listener bubbles
 * regardless, and also keeps focus tracking in sync when the user
 * mouse-clicks a segment directly.
 */
export function useRovingMenuFocus(
  children: ReactNode,
  containerRef: RefObject<HTMLElement | null>,
) {
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const itemNodesRef = useRef<Map<number, HTMLElement>>(new Map())
  const typeaheadRef = useRef<{ text: string; timeout: ReturnType<typeof setTimeout> | null }>({
    text: '',
    timeout: null,
  })

  const items = Children.toArray(children).reduce<MenuFocusItem[]>((acc, child, index) => {
    if (isMenuItemElement(child)) {
      acc.push({
        index,
        disabled: !!child.props.disabled,
        label: typeof child.props.children === 'string' ? child.props.children : '',
      })
    } else if (isMenuToggleElement(child)) {
      // No text label to typeahead-match against — that's fine, typeahead
      // simply never lands on this item, which is the expected behavior.
      acc.push({ index, disabled: !!child.props.disabled, label: '' })
    }
    return acc
  }, [])

  const enabledIndices = useCallback(() => {
    return items.filter((item) => !item.disabled).map((item) => item.index)
  }, [items])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement
      for (const [index, node] of itemNodesRef.current) {
        if (node === target || node.contains(target)) {
          setFocusedIndex(index)
          return
        }
      }
    }

    container.addEventListener('focusin', handleFocusIn)
    return () => container.removeEventListener('focusin', handleFocusIn)
  }, [containerRef])

  const focusItemByIndex = useCallback((index: number) => {
    const node = itemNodesRef.current.get(index)
    if (!node) return
    if (node instanceof HTMLButtonElement) {
      node.focus()
      return
    }
    // Composite item (Menu.Toggle): delegate focus to its checked radio (or
    // the first one), rather than the non-focusable wrapper div.
    const radios = node.querySelectorAll<HTMLInputElement>('input[type="radio"]')
    const checked = Array.from(radios).find((radio) => radio.checked) ?? radios[0]
    checked?.focus()
  }, [])

  const moveFocus = useCallback(
    (direction: 1 | -1) => {
      const indices = enabledIndices()
      if (indices.length === 0) return
      const currentPos = indices.indexOf(focusedIndex)
      const nextPos =
        currentPos === -1
          ? direction === 1
            ? 0
            : indices.length - 1
          : (currentPos + direction + indices.length) % indices.length
      focusItemByIndex(indices[nextPos])
    },
    [enabledIndices, focusedIndex, focusItemByIndex],
  )

  const moveFocusToEnd = useCallback(
    (end: 'first' | 'last') => {
      const indices = enabledIndices()
      if (indices.length === 0) return
      focusItemByIndex(end === 'first' ? indices[0] : indices[indices.length - 1])
    },
    [enabledIndices, focusItemByIndex],
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
      const currentPos = indices.indexOf(focusedIndex)
      // Start searching just after the current item so repeated presses of
      // the same letter cycle through matches.
      for (let offset = 1; offset <= indices.length; offset++) {
        const candidateIndex = indices[(currentPos + offset) % indices.length]
        const item = items.find((it) => it.index === candidateIndex)
        if (item && item.label.toLowerCase().startsWith(state.text)) {
          focusItemByIndex(candidateIndex)
          return
        }
      }
    },
    [enabledIndices, focusedIndex, focusItemByIndex, items],
  )

  const resetFocus = useCallback(() => setFocusedIndex(-1), [])

  return {
    focusedIndex,
    itemNodesRef,
    enabledIndices,
    focusItemByIndex,
    moveFocus,
    moveFocusToEnd,
    moveFocusByTypeahead,
    resetFocus,
  }
}
