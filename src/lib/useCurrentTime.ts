import { useSyncExternalStore } from 'preact/compat'

let currentTime: Date = new Date()

const subscribers = new Set<() => void>()

function getTime() {
  return currentTime
}

function updateTime() {
  currentTime = new Date()
  for (const subscriber of subscribers.values()) {
    subscriber()
  }
  setTimeout(updateTime, 1000)
}

updateTime()

function subscribe(notify: () => void) {
  subscribers.add(notify)
  return notify
}

function unsubscribe(notify: () => void) {
  subscribers.delete(notify)
}

export function useCurrentTime() {
  return useSyncExternalStore((notify) => {
    const id = subscribe(notify)
    return () => unsubscribe(id)
  }, getTime)
}
