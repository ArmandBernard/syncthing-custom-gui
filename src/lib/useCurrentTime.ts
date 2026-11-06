import { useSyncExternalStore } from 'preact/compat'

let currentTime: Date = new Date()

const subscribers = new Map<number, () => void>()

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
  const id = Math.random()
  subscribers.set(id, notify)
  return id
}

function unsubscribe(id: number) {
  subscribers.delete(id)
}

export function useCurrentTime() {
  return useSyncExternalStore((notify) => {
    const id = subscribe(notify)
    return () => unsubscribe(id)
  }, getTime)
}
