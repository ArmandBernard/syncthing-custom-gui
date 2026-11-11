import { act, cleanup, renderHook } from '@testing-library/preact'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useCurrentTime } from './useCurrentTime.ts'
import dayJs from 'dayjs'
import { getTimeoutTimers } from '@lib/getTimeoutTimers.testUtil.ts'

const startTime = dayJs('2026-01-01T00:00:00Z')

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(startTime.toDate())
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

function renderUseCurrentTime() {
  return renderHook(() => useCurrentTime())
}

describe('useCurrentTime', () => {
  it('returns the current time', () => {
    const { result } = renderUseCurrentTime()

    expect(result.current.toISOString()).toBe(startTime.toISOString())
  })

  it('does not run a timer while nothing is mounted', async () => {
    await unmountHook(renderUseCurrentTime().unmount)

    expect(getTimeoutTimers()).toHaveLength(0)
  })

  it('updates the time every second', async () => {
    const { result } = renderUseCurrentTime()

    await advance(1000)
    expect(result.current.toISOString()).toBe(startTime.add(1, 's').toISOString())

    await advance(2000)
    expect(result.current.toISOString()).toBe(startTime.add(3, 's').toISOString())
  })

  it('re-renders on every tick', async () => {
    let renders = 0
    renderHook(() => {
      renders++
      return useCurrentTime()
    })
    await advance(0)
    const initial = renders

    // one tick at a time: act batches everything inside it into a single render
    for (let i = 0; i < 3; i++) {
      await advance(1000)
    }

    expect(renders - initial).toBe(3)
  })

  it('shares one timer between multiple hooks', async () => {
    const first = renderUseCurrentTime()
    const second = renderUseCurrentTime()

    expect(getTimeoutTimers()).toHaveLength(1)

    await advance(1000)
    expect(first.result.current.toISOString()).toBe(startTime.add(1, 's').toISOString())
    expect(second.result.current).toBe(first.result.current)
  })

  it('keeps ticking for remaining hooks when one unmounts', async () => {
    const stays = renderUseCurrentTime()
    const leaves = renderUseCurrentTime()

    await unmountHook(leaves.unmount)
    await advance(2000)

    expect(getTimeoutTimers()).toHaveLength(1)
    expect(stays.result.current.toISOString()).toBe(startTime.add(2, 's').toISOString())
  })

  it('stops ticking when the last hook unmounts', async () => {
    const { unmount } = renderUseCurrentTime()

    await unmountHook(unmount)
    await advance(5000)

    expect(getTimeoutTimers()).toHaveLength(0)
  })

  it('does not stack timers when remounting before the pending tick fires', async () => {
    await unmountHook(renderUseCurrentTime().unmount)
    await advance(500)

    const { result } = renderUseCurrentTime()

    expect(getTimeoutTimers()).toHaveLength(1)

    await advance(3000)
    expect(result.current.toISOString()).toBe(startTime.add(3500, 'ms').toISOString())
  })

  it('refreshes a stale time when mounting after an idle period', async () => {
    await unmountHook(renderUseCurrentTime().unmount)

    vi.setSystemTime(new Date('2026-01-01T01:00:00Z'))
    const { result } = renderUseCurrentTime()

    expect(result.current.toISOString()).toBe('2026-01-01T01:00:00.000Z')
  })
})

function advance(ms: number) {
  return act(async () => {
    await vi.advanceTimersByTimeAsync(ms)
  })
}

// Unmounting inside act flushes Preact's deferred effect cleanup, which is what clears our timer.
function unmountHook(unmount: () => void) {
  return act(() => unmount())
}
