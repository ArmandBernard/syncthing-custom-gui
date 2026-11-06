import { useSyncExternalStore } from 'preact/compat'

let currentTime: Date = new Date()

const subscribers = new Set<() => void>()

let timer: ReturnType<typeof setTimeout> | undefined

function tick() {
  currentTime = new Date()
  subscribers.forEach((notify) => notify())
  timer = setTimeout(tick, 1000)
}

function subscribe(notify: () => void) {
  subscribers.add(notify)
  if (subscribers.size === 1) {
    currentTime = new Date()
    timer = setTimeout(tick, 1000)
    notify() // needed so a fresh value is read
  }

  // unsubscribe
  return () => {
    subscribers.delete(notify)
    if (subscribers.size === 0) {
      clearTimeout(timer)
      timer = undefined
    }
  }
}

function getTime() {
  return currentTime
}

export function useCurrentTime() {
  return useSyncExternalStore(subscribe, getTime)
}
