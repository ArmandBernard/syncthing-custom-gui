import { act, renderHook } from '@testing-library/preact'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useSystemPreferredTheme } from './useSystemPreferredTheme.ts'

type Scheme = 'dark' | 'light' | null

let scheme: Scheme = null
const listeners = new Set<() => void>()

beforeEach(() => {
  scheme = null
  listeners.clear()
  vi.stubGlobal('matchMedia', (query: string) => ({
    get matches() {
      return query.includes(`: ${scheme}`)
    },
    addEventListener: (_: string, fn: () => void) => listeners.add(fn),
    removeEventListener: (_: string, fn: () => void) => listeners.delete(fn),
  }))
})

afterEach(() => {
  vi.unstubAllGlobals()
})

function setSystemScheme(value: Scheme) {
  scheme = value
  return act(() => listeners.forEach((notify) => notify()))
}

describe('useSystemPreferredTheme', () => {
  it.each(['dark', 'light'] as const)('reflects a %s preference', (value) => {
    scheme = value
    const { result } = renderHook(() => useSystemPreferredTheme())

    expect(result.current).toBe(value)
  })

  it('returns null when the system has no preference', () => {
    const { result } = renderHook(() => useSystemPreferredTheme())

    expect(result.current).toBeNull()
  })

  it('updates when the colour scheme changes', async () => {
    scheme = 'light'
    const { result } = renderHook(() => useSystemPreferredTheme())

    await setSystemScheme('dark')
    expect(result.current).toBe('dark')

    await setSystemScheme('light')
    expect(result.current).toBe('light')

    await setSystemScheme(null)
    expect(result.current).toBeNull()
  })

  it('stops listening when unmounted', async () => {
    const { unmount } = renderHook(() => useSystemPreferredTheme())
    expect(listeners.size).toBe(1)

    // Preact defers effect cleanup, so unmount inside act to flush it
    await act(() => unmount())
    expect(listeners.size).toBe(0)
  })
})
