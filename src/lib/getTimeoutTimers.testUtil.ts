/**
 * Get timers for tests. `vi.getTimerCount()` also counts Preact's own after-paint timers
 * (a requestAnimationFrame plus a ~35ms setTimeout fallback with a type of "AnimationFrame"),
 * so we read the fake clock directly and filter out non-Timeout timers.
 */
export function getTimeoutTimers() {
  // This is an undocumented API.
  const { clock } = setTimeout as unknown as { clock: { timers: Map<number, FakeTimer> } }
  return [...clock.timers.values()].filter((t) => t.type === 'Timeout')
}

interface FakeTimer {
  type: string
  delay: number
}
